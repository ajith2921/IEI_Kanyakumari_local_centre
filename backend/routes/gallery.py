from pathlib import Path
from typing import Optional
import os
from datetime import datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from supabase import create_client

from auth import get_current_active_user
from supabase_db import admin_db
from schemas import GalleryOut

# Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

router = APIRouter(prefix="/gallery", tags=["Gallery"])


def _require_value(value: str, field_label: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        raise HTTPException(status_code=400, detail=f"{field_label} is required.")
    return cleaned


@router.get("", response_model=list[GalleryOut])
def list_gallery() -> list[dict]:
    """Get all gallery items"""
    try:
        items = admin_db.order_by("gallery", "created_at", ascending=False)
        return items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{item_id}", response_model=GalleryOut)
def get_gallery_item(item_id: int) -> dict:
    """Get single gallery item"""
    try:
        item = admin_db.select_one("gallery", {"id": item_id})
        if not item:
            raise HTTPException(status_code=404, detail="Gallery item not found")
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=GalleryOut, status_code=status.HTTP_201_CREATED)
def create_gallery_item(
    title: str = Form(...),
    description: str = Form(default=""),
    image: Optional[UploadFile] = File(default=None),
    image_url: str = Form(default=""),
    _current_user = Depends(get_current_active_user),
) -> dict:
    """Create gallery item with image upload to Supabase Storage"""
    try:
        normalized_title = _require_value(title, "Title")
        normalized_description = description.strip()

        image_url_value = ""

        # Upload image to Supabase Storage
        if image and image.filename:
            content = image.file.read()
            
            if len(content) > 10 * 1024 * 1024:  # 10MB max
                raise HTTPException(status_code=413, detail="Image too large. Max 10MB.")
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            img_path = f"gallery_{timestamp}{Path(image.filename).suffix}"
            
            supabase.storage.from_("gallery").upload(
                path=img_path,
                file=content,
                file_options={"content-type": image.content_type or "image/jpeg"}
            )
            
            image_url_value = supabase.storage.from_("gallery").get_public_url(img_path)
        elif image_url.strip():
            image_url_value = image_url.strip()
        else:
            raise HTTPException(
                status_code=400,
                detail="Please upload an image file or provide an image URL."
            )

        # Create gallery item in Supabase
        item_data = {
            "title": normalized_title,
            "description": normalized_description,
            "image_url": image_url_value,
        }
        
        created_item = admin_db.insert("gallery", item_data)
        return created_item
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating gallery item: {str(e)}")


@router.delete(
    "/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
)
def delete_gallery_item(
    item_id: int,
    _current_user = Depends(get_current_active_user),
) -> None:
    """Delete gallery item"""
    try:
        count = admin_db.delete("gallery", {"id": item_id})
        if count == 0:
            raise HTTPException(status_code=404, detail="Gallery item not found")
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting gallery item: {str(e)}")
