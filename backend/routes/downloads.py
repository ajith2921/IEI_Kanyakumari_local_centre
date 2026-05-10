from __future__ import annotations

from pathlib import Path
from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from auth import get_current_active_user
from supabase_db import admin_db, get_supabase_admin_client
from schemas import DownloadOut

router = APIRouter(prefix="/downloads", tags=["Downloads"])


@router.get("", response_model=list[DownloadOut])
def list_downloads() -> list[dict]:
    """Get all downloads"""
    try:
        downloads = admin_db.order_by("downloads", "created_at", ascending=False)
        return downloads
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=DownloadOut, status_code=status.HTTP_201_CREATED)
def create_download(
    title: str = Form(...),
    description: str = Form(default=""),
    pdf: UploadFile = File(...),
    _current_user = Depends(get_current_active_user),
) -> dict:
    """Create download with PDF upload to Supabase Storage"""
    try:
        content = pdf.file.read()
        supabase = get_supabase_admin_client()
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
            "title": title,
            "description": description,
            "pdf_url": pdf_url,
        }
        
        created_download = admin_db.insert("downloads", download_data)
        return created_download
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating download: {str(e)}")


@router.put("/{download_id}", response_model=DownloadOut)
def update_download(
    download_id: int,
    title: str = Form(...),
    description: str = Form(default=""),
    pdf: Optional[UploadFile] = File(default=None),
    _current_user = Depends(get_current_active_user),
) -> dict:
    """Update download with optional PDF upload to Supabase Storage"""
    try:
        # Check download exists
        download = admin_db.select_one("downloads", {"id": download_id})
        if not download:
            raise HTTPException(status_code=404, detail="Download not found")

        update_data = {
            "title": title,
            "description": description,
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
    _current_user = Depends(get_current_active_user),
) -> None:
    """Delete download"""
    try:
        count = admin_db.delete("downloads", {"id": download_id})
        if count == 0:
            raise HTTPException(status_code=404, detail="Download not found")
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting download: {str(e)}")
