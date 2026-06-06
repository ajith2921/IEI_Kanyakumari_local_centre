from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Request, UploadFile, status

from auth import get_current_active_user
from supabase_db import admin_db, get_supabase_admin_client, delete_storage_file
from schemas import ConferenceCreate, ConferenceUpdate, ConferenceOut
from audit import log_action

router = APIRouter(prefix="/conferences", tags=["Conferences"])


def _normalize_conference_status(conference: dict) -> dict:
    status_value = conference.get("status")
    if status_value is None or str(status_value).strip() == "":
        conference = dict(conference)
        conference["status"] = "inactive"
    return conference


# 20 MB limit for conference uploads
_CONF_MAX_UPLOAD_BYTES = 20 * 1024 * 1024


def _upload_conference_file(file: UploadFile, prefix: str, bucket: str, content_type: Optional[str] = None) -> str:
    content = file.file.read()
    if not content:
        return ""

    if len(content) > _CONF_MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large. Max 20 MB allowed.")

    supabase = get_supabase_admin_client()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    remote_path = f"{prefix}_{timestamp}{Path(file.filename).suffix}"
    supabase.storage.from_(bucket).upload(
        path=remote_path,
        file=content,
        file_options={"content-type": content_type or file.content_type or "application/octet-stream"},
    )
    return supabase.storage.from_(bucket).get_public_url(remote_path)

@router.get("/active", response_model=ConferenceOut)
def get_active_conference():
    """Get active conference or most recent one"""
    try:
        # Try to get active conference
        conferences = admin_db.select("conferences", filters={"status": "active"})
        if conferences:
            return _normalize_conference_status(conferences[0])
        
        # If no active, get most recent
        conferences = admin_db.order_by("conferences", "created_at", ascending=False, limit=1)
        if conferences:
            return _normalize_conference_status(conferences[0])
        
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No conferences found"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def get_all_conferences(page: int = Query(1, ge=1), limit: int = Query(10, ge=1, le=100)):
    """Get paginated conferences (server-side DB pagination)"""
    try:
        result = admin_db.select_paginated(
            "conferences",
            order_by="created_at",
            ascending=False,
            page=page,
            limit=limit,
        )
        result["items"] = [_normalize_conference_status(c) for c in result["items"]]
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=ConferenceOut, status_code=status.HTTP_201_CREATED)
def create_conference(
    request: Request,
    title: str = Form(...),
    short_title: str = Form(...),
    description: str = Form(default=""),
    start_date: str = Form(...),
    end_date: str = Form(...),
    registration_deadline: str = Form(...),
    venue: str = Form(default=""),
    button_text: str = Form(default="More Details"),
    link: str = Form(default="/conference-overview"),
    image_url: str = Form(default=""),
    pdf_url: str = Form(default=""),
    image: Optional[UploadFile] = File(default=None),
    pdf: Optional[UploadFile] = File(default=None),
    status: str = Form(default="active"),
    is_new: bool = Form(default=True),
    current_user: dict = Depends(get_current_active_user),
):
    """Create new conference"""
    try:
        image_url_value = image_url.strip()
        pdf_url_value = pdf_url.strip()

        if image and image.filename:
            image_url_value = _upload_conference_file(image, "conference_image", "conferences")

        if pdf and pdf.filename:
            pdf_url_value = _upload_conference_file(pdf, "conference_pdf", "conferences", "application/pdf")

        payload = ConferenceCreate(
            title=title,
            short_title=short_title,
            description=description,
            start_date=start_date,
            end_date=end_date,
            registration_deadline=registration_deadline,
            venue=venue,
            button_text=button_text,
            link=link,
            image_url=image_url_value,
            pdf_url=pdf_url_value,
            status=status,
            is_new=is_new,
        )

        # If this one is active, deactivate all others in one pass
        if payload.status == "active":
            other_confs = admin_db.select("conferences", filters={"status": "active"})
            for conf in other_confs:
                admin_db.update("conferences", {"status": "inactive"}, {"id": conf["id"]})

        new_conf = admin_db.insert("conferences", payload.model_dump())

        log_action(
            request=request,
            current_user=current_user,
            action="CREATE",
            module="conferences",
            record_id=new_conf.get("id"),
            new_data=new_conf,
        )
        return new_conf
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating conference: {str(e)}")

@router.put("/{conf_id}", response_model=ConferenceOut)
def update_conference(
    conf_id: int,
    request: Request,
    title: str = Form(...),
    short_title: str = Form(...),
    description: str = Form(default=""),
    start_date: str = Form(...),
    end_date: str = Form(...),
    registration_deadline: str = Form(...),
    venue: str = Form(default=""),
    button_text: str = Form(default="More Details"),
    link: str = Form(default="/conference-overview"),
    image_url: str = Form(default=""),
    pdf_url: str = Form(default=""),
    image: Optional[UploadFile] = File(default=None),
    pdf: Optional[UploadFile] = File(default=None),
    status: str = Form(default="active"),
    is_new: bool = Form(default=True),
    current_user: dict = Depends(get_current_active_user),
):
    """Update conference"""
    try:
        conf = admin_db.select_one("conferences", {"id": conf_id})
        if not conf:
            raise HTTPException(status_code=404, detail="Conference not found")

        update_data = {
            "title": title,
            "short_title": short_title,
            "description": description,
            "start_date": start_date,
            "end_date": end_date,
            "registration_deadline": registration_deadline,
            "venue": venue,
            "button_text": button_text,
            "link": link,
            "image_url": image_url.strip() or conf.get("image_url", ""),
            "pdf_url": pdf_url.strip() or conf.get("pdf_url", ""),
            "status": status,
            "is_new": is_new,
        }

        if image and image.filename:
            update_data["image_url"] = _upload_conference_file(image, f"conference_{conf_id}_image", "conferences")

        if pdf and pdf.filename:
            update_data["pdf_url"] = _upload_conference_file(pdf, f"conference_{conf_id}_pdf", "conferences", "application/pdf")
        
        # If setting to active, deactivate other active conferences
        if update_data["status"] == "active" and conf.get("status") != "active":
            other_active = admin_db.select("conferences", filters={"status": "active"})
            for other_conf in other_active:
                if other_conf["id"] != conf_id:
                    admin_db.update("conferences", {"status": "inactive"}, {"id": other_conf["id"]})
        
        updated_conf = admin_db.update("conferences", update_data, {"id": conf_id})

        log_action(
            request=request,
            current_user=current_user,
            action="UPDATE",
            module="conferences",
            record_id=conf_id,
            old_data=conf,
            new_data=updated_conf,
        )
        return updated_conf
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating conference: {str(e)}")

@router.delete("/{conf_id}")
def delete_conference(
    conf_id: int,
    request: Request,
    current_user: dict = Depends(get_current_active_user),
):
    """Delete conference"""
    try:
        conf = admin_db.select_one("conferences", {"id": conf_id})
        if not conf:
            raise HTTPException(status_code=404, detail="Conference not found")

        admin_db.delete("conferences", {"id": conf_id})

        if conf:
            if conf.get("image_url"):
                delete_storage_file("conferences", conf["image_url"])
            if conf.get("pdf_url"):
                delete_storage_file("conferences", conf["pdf_url"])

        log_action(
            request=request,
            current_user=current_user,
            action="DELETE",
            module="conferences",
            record_id=conf_id,
            old_data=conf,
        )
        return {"message": "Conference deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting conference: {str(e)}")
