from __future__ import annotations

from pathlib import Path
from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from auth import get_current_active_user
from supabase_db import admin_db, get_supabase_admin_client
from schemas import NewsletterOut
from routes.utils import require_value

router = APIRouter(prefix="/newsletters", tags=["Newsletters"])


@router.get("", response_model=list[NewsletterOut])
def list_newsletters() -> list[dict]:
    """Get all newsletters"""
    try:
        newsletters = admin_db.order_by("newsletters", "published_at", ascending=False)
        return newsletters
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=NewsletterOut, status_code=status.HTTP_201_CREATED)
def create_newsletter(
    title: str = Form(default=""),
    summary: str = Form(default=""),
    pdf: Optional[UploadFile] = File(default=None),
    _current_user = Depends(get_current_active_user),
) -> dict:
    """Create newsletter with PDF upload to Supabase Storage"""
    try:
        pdf_url = None
        supabase = get_supabase_admin_client()
        # Upload PDF to Supabase Storage
        if pdf and pdf.filename:
            content = pdf.file.read()
            
            if len(content) > 50 * 1024 * 1024:  # 50MB max
                raise HTTPException(status_code=413, detail="PDF too large. Max 50MB.")
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            pdf_path = f"newsletter_{timestamp}{Path(pdf.filename).suffix}"
            
            supabase.storage.from_("newsletters").upload(
                path=pdf_path,
                file=content,
                file_options={"content-type": "application/pdf"}
            )
            
            pdf_url = supabase.storage.from_("newsletters").get_public_url(pdf_path)

        # Create newsletter in Supabase
        newsletter_data = {
            "title": require_value(title, "Title"),
            "summary": summary.strip() or None,
            "pdf_url": pdf_url,
        }
        
        created_newsletter = admin_db.insert("newsletters", newsletter_data)
        return created_newsletter
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating newsletter: {str(e)}")


@router.put("/{newsletter_id}", response_model=NewsletterOut)
def update_newsletter(
    newsletter_id: int,
    title: str = Form(default=""),
    summary: str = Form(default=""),
    pdf: Optional[UploadFile] = File(default=None),
    _current_user = Depends(get_current_active_user),
) -> dict:
    """Update newsletter with optional PDF upload to Supabase Storage"""
    try:
        # Check newsletter exists
        newsletter = admin_db.select_one("newsletters", {"id": newsletter_id})
        if not newsletter:
            raise HTTPException(status_code=404, detail="Newsletter not found")

        update_data = {
            "title": require_value(title, "Title"),
            "summary": summary.strip() or None,
        }
        supabase = get_supabase_admin_client()
        # Handle PDF upload
        if pdf and pdf.filename:
            content = pdf.file.read()
            if len(content) > 50 * 1024 * 1024:
                raise HTTPException(status_code=413, detail="PDF too large. Max 50MB.")
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            pdf_path = f"newsletter_{newsletter_id}_{timestamp}{Path(pdf.filename).suffix}"
            
            supabase.storage.from_("newsletters").upload(
                path=pdf_path,
                file=content,
                file_options={"content-type": "application/pdf"}
            )
            update_data["pdf_url"] = supabase.storage.from_("newsletters").get_public_url(pdf_path)

        # Update in Supabase
        updated_newsletter = admin_db.update("newsletters", update_data, {"id": newsletter_id})
        return updated_newsletter
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating newsletter: {str(e)}")


@router.get("/{newsletter_id}", response_model=NewsletterOut)
def get_newsletter(newsletter_id: int) -> dict:
    """Get single newsletter"""
    try:
        newsletter = admin_db.select_one("newsletters", {"id": newsletter_id})
        if not newsletter:
            raise HTTPException(status_code=404, detail="Newsletter not found")
        return newsletter
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete(
    "/{newsletter_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
)
def delete_newsletter(
    newsletter_id: int,
    _current_user = Depends(get_current_active_user),
) -> None:
    """Delete newsletter"""
    try:
        count = admin_db.delete("newsletters", {"id": newsletter_id})
        if count == 0:
            raise HTTPException(status_code=404, detail="Newsletter not found")
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting newsletter: {str(e)}")
