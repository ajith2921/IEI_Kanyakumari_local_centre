from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, UploadFile, status

from auth import get_current_active_user
from supabase_db import admin_db, get_supabase_admin_client, delete_storage_file
from audit import log_action

router = APIRouter(prefix="/conference-portal", tags=["Conference Portal"])

# Mapping of valid API resource paths to their actual DB table names
VALID_RESOURCES = {
    "dates": "conference_dates",
    "speakers": "conference_speakers",
    "committees": "conference_committees",
    "registrations": "conference_registrations",
    "submissions": "conference_submissions",
    "schedule": "conference_schedule",
    "sponsors": "conference_sponsors",
    "downloads": "conference_downloads",
    "gallery": "conference_gallery",
    "faq": "conference_faq",
    "tracks": "conference_tracks",
    "venue": "conference_venue",
}

# 50 MB limit for conference portal uploads
_MAX_UPLOAD_BYTES = 50 * 1024 * 1024

def _upload_file(file: UploadFile, prefix: str) -> str:
    content = file.file.read()
    if not content:
        return ""

    if len(content) > _MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large. Max 50 MB allowed.")

    supabase = get_supabase_admin_client()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_filename = Path(file.filename).name.replace(" ", "_")
    remote_path = f"{prefix}_{timestamp}_{safe_filename}"
    
    supabase.storage.from_("conference-portal").upload(
        path=remote_path,
        file=content,
        file_options={"content-type": file.content_type or "application/octet-stream"},
    )
    return supabase.storage.from_("conference-portal").get_public_url(remote_path)


@router.get("/{resource}")
def get_resource(resource: str, conference_id: Optional[int] = Query(None), page: int = Query(1), limit: int = Query(100)):
    """Generic GET for conference portal resources"""
    if resource not in VALID_RESOURCES:
        raise HTTPException(status_code=404, detail="Resource not found")
        
    table = VALID_RESOURCES[resource]
    filters = {}
    if conference_id:
        filters["conference_id"] = conference_id
        
    try:
        # Default sort
        sort_col = "sort_order" if resource in ["dates", "speakers", "committees", "schedule", "sponsors", "downloads", "gallery", "faq", "tracks"] else "created_at"
        asc = True if sort_col == "sort_order" else False
        
        result = admin_db.select_paginated(
            table,
            filters=filters,
            order_by=sort_col,
            ascending=asc,
            page=page,
            limit=limit,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{resource}")
async def create_resource(resource: str, request: Request, current_user: dict = Depends(get_current_active_user)):
    """Generic POST for conference portal resources"""
    if resource not in VALID_RESOURCES:
        raise HTTPException(status_code=404, detail="Resource not found")
        
    # Public can post to registrations and submissions, everything else requires auth
    # Actually, we applied `current_user` dependency, so all endpoints require auth here.
    # We will make public submission endpoints separately if needed, or handle it via a separate unauthenticated router.
    # Wait, the `get_current_active_user` is applied to all generic POSTs.
    
    table = VALID_RESOURCES[resource]
    form_data = await request.form()
    payload = {}
    
    # Process form data
    for key, value in form_data.items():
        if isinstance(value, UploadFile):
            if value.filename:
                # Handle file upload
                url = _upload_file(value, f"{resource}_{key}")
                payload[key] = url
        else:
            payload[key] = value

    if "conference_id" not in payload:
        raise HTTPException(status_code=400, detail="conference_id is required")

    try:
        new_record = admin_db.insert(table, payload)
        log_action(request, current_user, "CREATE", table, new_record.get("id"), new_data=new_record)
        return new_record
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{resource}/{item_id}")
async def update_resource(resource: str, item_id: int, request: Request, current_user: dict = Depends(get_current_active_user)):
    """Generic PUT for conference portal resources"""
    if resource not in VALID_RESOURCES:
        raise HTTPException(status_code=404, detail="Resource not found")
        
    table = VALID_RESOURCES[resource]
    form_data = await request.form()
    payload = {}
    
    old_record = admin_db.select_one(table, {"id": item_id})
    if not old_record:
        raise HTTPException(status_code=404, detail="Record not found")
    
    # Process form data
    for key, value in form_data.items():
        if isinstance(value, UploadFile):
            if value.filename:
                url = _upload_file(value, f"{resource}_{key}")
                payload[key] = url
        else:
            payload[key] = value

    try:
        updated_record = admin_db.update(table, payload, {"id": item_id})
        log_action(request, current_user, "UPDATE", table, item_id, old_data=old_record, new_data=updated_record)
        return updated_record
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{resource}/{item_id}")
def delete_resource(resource: str, item_id: int, request: Request, current_user: dict = Depends(get_current_active_user)):
    """Generic DELETE for conference portal resources"""
    if resource not in VALID_RESOURCES:
        raise HTTPException(status_code=404, detail="Resource not found")
        
    table = VALID_RESOURCES[resource]
    old_record = admin_db.select_one(table, {"id": item_id})
    if not old_record:
        raise HTTPException(status_code=404, detail="Record not found")
        
    try:
        admin_db.delete(table, {"id": item_id})
        
        # Try to delete associated files (image_url, pdf_url, logo_url, file_url)
        for key in ["image_url", "pdf_url", "logo_url", "file_url"]:
            if old_record.get(key):
                try:
                    delete_storage_file("conference-portal", old_record[key])
                except:
                    pass
                    
        log_action(request, current_user, "DELETE", table, item_id, old_data=old_record)
        return {"message": "Deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =====================================================================
# PUBLIC ENDPOINTS for Registrations and Submissions
# =====================================================================
public_router = APIRouter(prefix="/public/conference-portal", tags=["Conference Portal Public"])

@public_router.post("/registrations")
async def public_register(request: Request):
    form_data = await request.form()
    payload = dict(form_data)
    
    if "conference_id" not in payload:
        raise HTTPException(status_code=400, detail="conference_id required")
        
    try:
        new_record = admin_db.insert("conference_registrations", payload)
        return {"message": "Registration successful", "id": new_record.get("id")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@public_router.post("/submissions")
async def public_submit(request: Request):
    form_data = await request.form()
    payload = {}
    
    for key, value in form_data.items():
        if isinstance(value, UploadFile):
            if value.filename:
                url = _upload_file(value, f"submissions_pdf")
                payload[key] = url
        else:
            payload[key] = value
            
    if "conference_id" not in payload:
        raise HTTPException(status_code=400, detail="conference_id required")
        
    try:
        new_record = admin_db.insert("conference_submissions", payload)
        return {"message": "Submission successful", "id": new_record.get("id")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
