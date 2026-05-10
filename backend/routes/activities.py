from pathlib import Path
from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from auth import get_current_active_user
from supabase_db import admin_db, get_supabase_admin_client
from schemas import ActivityOut
from routes.utils import require_value

router = APIRouter(prefix="/activities", tags=["Activities"])



@router.get("", response_model=list[ActivityOut])
def list_activities() -> list[dict]:
    """Get all activities"""
    try:
        activities = admin_db.order_by("activities", "created_at", ascending=False)
        return activities
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{activity_id}", response_model=ActivityOut)
def get_activity(activity_id: int) -> dict:
    """Get single activity"""
    try:
        activity = admin_db.select_one("activities", {"id": activity_id})
        if not activity:
            raise HTTPException(status_code=404, detail="Activity not found")
        return activity
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=ActivityOut, status_code=status.HTTP_201_CREATED)
def create_activity(
    title: str = Form(...),
    description: str = Form(default=""),
    event_date: str = Form(default=""),
    image_url: str = Form(default=""),
    image: Optional[UploadFile] = File(default=None),
    pdf: Optional[UploadFile] = File(default=None),
    colab: Optional[UploadFile] = File(default=None),
    _current_user = Depends(get_current_active_user),
) -> dict:
    """Create activity with file uploads to Supabase Storage"""
    try:
        normalized_title = require_value(title, "Title")
        normalized_description = description.strip()
        normalized_event_date = event_date.strip()

        image_url_value = ""
        pdf_url_value = ""
        colab_url_value = ""
        supabase = get_supabase_admin_client()

        # Upload image to Supabase Storage
        if image and image.filename:
            content = image.file.read()
            
            if len(content) > 10 * 1024 * 1024:  # 10MB max
                raise HTTPException(status_code=413, detail="Image file too large. Max 10MB.")
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            img_path = f"activity_img_{timestamp}{Path(image.filename).suffix}"
            
            supabase.storage.from_("activities").upload(
                path=img_path,
                file=content,
                file_options={"content-type": image.content_type or "image/jpeg"}
            )
            
            image_url_value = supabase.storage.from_("activities").get_public_url(img_path)
        elif image_url.strip():
            image_url_value = image_url.strip()

        # Upload PDF to Supabase Storage
        if pdf and pdf.filename:
            content = pdf.file.read()
            
            if len(content) > 50 * 1024 * 1024:  # 50MB max
                raise HTTPException(status_code=413, detail="PDF file too large. Max 50MB.")
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            pdf_path = f"activity_pdf_{timestamp}{Path(pdf.filename).suffix}"
            
            supabase.storage.from_("activities").upload(
                path=pdf_path,
                file=content,
                file_options={"content-type": "application/pdf"}
            )
            
            pdf_url_value = supabase.storage.from_("activities").get_public_url(pdf_path)

        # Upload Colab file to Supabase Storage
        if colab and colab.filename:
            content = colab.file.read()
            
            if len(content) > 100 * 1024 * 1024:  # 100MB max
                raise HTTPException(status_code=413, detail="Colab file too large. Max 100MB.")
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            colab_path = f"activity_colab_{timestamp}{Path(colab.filename).suffix}"
            
            supabase.storage.from_("activities").upload(
                path=colab_path,
                file=content,
                file_options={"content-type": colab.content_type or "application/octet-stream"}
            )
            
            colab_url_value = supabase.storage.from_("activities").get_public_url(colab_path)

        # Create activity in Supabase
        activity_data = {
            "title": normalized_title,
            "description": normalized_description,
            "event_date": normalized_event_date,
            "image_url": image_url_value,
            "pdf_url": pdf_url_value,
            "colab_url": colab_url_value,
        }
        
        created_activity = admin_db.insert("activities", activity_data)
        return created_activity
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating activity: {str(e)}")


@router.put("/{activity_id}", response_model=ActivityOut)
def update_activity(
    activity_id: int,
    title: str = Form(...),
    description: str = Form(default=""),
    event_date: str = Form(default=""),
    image_url: str = Form(default=""),
    image: Optional[UploadFile] = File(default=None),
    pdf: Optional[UploadFile] = File(default=None),
    colab: Optional[UploadFile] = File(default=None),
    _current_user = Depends(get_current_active_user),
) -> dict:
    """Update activity with optional file uploads to Supabase Storage"""
    try:
        # Check activity exists
        activity = admin_db.select_one("activities", {"id": activity_id})
        if not activity:
            raise HTTPException(status_code=404, detail="Activity not found")

        normalized_title = require_value(title, "Title")
        normalized_description = description.strip()
        normalized_event_date = event_date.strip()

        update_data = {
            "title": normalized_title,
            "description": normalized_description,
            "event_date": normalized_event_date,
        }
        supabase = get_supabase_admin_client()

        # Handle image upload
        if image and image.filename:
            content = image.file.read()
            if len(content) > 10 * 1024 * 1024:
                raise HTTPException(status_code=413, detail="Image too large. Max 10MB.")
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            img_path = f"activity_{activity_id}_img_{timestamp}{Path(image.filename).suffix}"
            
            supabase.storage.from_("activities").upload(
                path=img_path,
                file=content,
                file_options={"content-type": image.content_type}
            )
            update_data["image_url"] = supabase.storage.from_("activities").get_public_url(img_path)
        elif image_url.strip():
            update_data["image_url"] = image_url.strip()

        # Handle PDF upload
        if pdf and pdf.filename:
            content = pdf.file.read()
            if len(content) > 50 * 1024 * 1024:
                raise HTTPException(status_code=413, detail="PDF too large. Max 50MB.")
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            pdf_path = f"activity_{activity_id}_pdf_{timestamp}{Path(pdf.filename).suffix}"
            
            supabase.storage.from_("activities").upload(
                path=pdf_path,
                file=content,
                file_options={"content-type": "application/pdf"}
            )
            update_data["pdf_url"] = supabase.storage.from_("activities").get_public_url(pdf_path)

        # Handle Colab upload
        if colab and colab.filename:
            content = colab.file.read()
            if len(content) > 100 * 1024 * 1024:
                raise HTTPException(status_code=413, detail="Colab too large. Max 100MB.")
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            colab_path = f"activity_{activity_id}_colab_{timestamp}{Path(colab.filename).suffix}"
            
            supabase.storage.from_("activities").upload(
                path=colab_path,
                file=content,
                file_options={"content-type": colab.content_type}
            )
            update_data["colab_url"] = supabase.storage.from_("activities").get_public_url(colab_path)

        # Update in Supabase
        updated_activity = admin_db.update("activities", update_data, {"id": activity_id})
        return updated_activity
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating activity: {str(e)}")


@router.delete(
    "/{activity_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
)
def delete_activity(
    activity_id: int,
    _current_user = Depends(get_current_active_user),
) -> None:
    """Delete activity"""
    try:
        count = admin_db.delete("activities", {"id": activity_id})
        if count == 0:
            raise HTTPException(status_code=404, detail="Activity not found")
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting activity: {str(e)}")
