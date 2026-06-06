from __future__ import annotations

from pathlib import Path
from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Request, UploadFile, status

from auth import get_current_active_user
from supabase_db import admin_db, get_supabase_admin_client, delete_storage_file
from schemas import DownloadOut
from routes.utils import require_value
from audit import log_action

router = APIRouter(prefix="/downloads", tags=["Downloads"])


@router.get("")
def list_downloads(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Get paginated downloads"""
    try:
        return admin_db.select_paginated(
            "downloads",
            order_by="created_at",
            ascending=False,
            page=page,
            limit=limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=DownloadOut, status_code=status.HTTP_201_CREATED)
def create_download(
    request: Request,
    title: str = Form(default=""),
    description: str = Form(default=""),
    pdf: Optional[UploadFile] = File(default=None),
    current_user: dict = Depends(get_current_active_user),
) -> dict:
    """Create download with PDF upload to Supabase Storage"""
    try:
        pdf_url = None
        supabase = get_supabase_admin_client()
        if pdf and pdf.filename:
            content = pdf.file.read()
            if len(content) > 100 * 1024 * 1024:  # 100MB max
                raise HTTPException(status_code=413, detail="PDF too large. Max 100MB.")
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            pdf_path = f"download_{timestamp}{Path(pdf.filename).suffix}"
            
            supabase.storage.from_("downloads").upload(
                path=pdf_path,
                file=content,
                file_options={"content-type": "application/pdf"}
            )
            
            pdf_url = supabase.storage.from_("downloads").get_public_url(pdf_path)

        # Create download in Supabase
        download_data = {
            "title": require_value(title, "Title"),
            "description": description.strip() or None,
            "pdf_url": pdf_url,
        }
        
        created_download = admin_db.insert("downloads", download_data)

        log_action(
            request=request,
            current_user=current_user,
            action="CREATE",
            module="downloads",
            record_id=created_download.get("id"),
            new_data=created_download,
        )
        return created_download

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating download: {str(e)}")


@router.put("/{download_id}", response_model=DownloadOut)
def update_download(
    download_id: int,
    request: Request,
    title: str = Form(default=""),
    description: str = Form(default=""),
    pdf: Optional[UploadFile] = File(default=None),
    current_user: dict = Depends(get_current_active_user),
) -> dict:
    """Update download with optional PDF upload to Supabase Storage"""
    try:
        # Check download exists
        download = admin_db.select_one("downloads", {"id": download_id})
        if not download:
            raise HTTPException(status_code=404, detail="Download not found")

        update_data = {
            "title": require_value(title, "Title"),
            "description": description.strip() or None,
        }
        supabase = get_supabase_admin_client()
        # Handle PDF upload
        if pdf and pdf.filename:
            content = pdf.file.read()
            if len(content) > 100 * 1024 * 1024:
                raise HTTPException(status_code=413, detail="PDF too large. Max 100MB.")
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            pdf_path = f"download_{download_id}_{timestamp}{Path(pdf.filename).suffix}"
            
            supabase.storage.from_("downloads").upload(
                path=pdf_path,
                file=content,
                file_options={"content-type": "application/pdf"}
            )
            update_data["pdf_url"] = supabase.storage.from_("downloads").get_public_url(pdf_path)

        # Update in Supabase
        updated_download = admin_db.update("downloads", update_data, {"id": download_id})

        log_action(
            request=request,
            current_user=current_user,
            action="UPDATE",
            module="downloads",
            record_id=download_id,
            old_data=download,
            new_data=updated_download,
        )
        return updated_download

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating download: {str(e)}")


@router.get("/{download_id}", response_model=DownloadOut)
def get_download(download_id: int) -> dict:
    """Get single download"""
    try:
        download = admin_db.select_one("downloads", {"id": download_id})
        if not download:
            raise HTTPException(status_code=404, detail="Download not found")
        return download
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete(
    "/{download_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
)
def delete_download(
    download_id: int,
    request: Request,
    current_user: dict = Depends(get_current_active_user),
) -> None:
    """Delete download"""
    try:
        download = admin_db.select_one("downloads", {"id": download_id})
        if not download:
            raise HTTPException(status_code=404, detail="Download not found")

        admin_db.delete("downloads", {"id": download_id})

        if download.get("pdf_url"):
            delete_storage_file("downloads", download["pdf_url"])

        log_action(
            request=request,
            current_user=current_user,
            action="DELETE",
            module="downloads",
            record_id=download_id,
            old_data=download,
        )
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting download: {str(e)}")
