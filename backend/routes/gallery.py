from pathlib import Path
from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Request, UploadFile, status

from auth import get_current_active_user
from supabase_db import admin_db, get_supabase_admin_client, delete_storage_file
from schemas import GalleryOut
from routes.utils import require_value, optional_value
from audit import log_action

router = APIRouter(prefix="/gallery", tags=["Gallery"])


@router.get("")
def list_gallery(page: int = Query(1, ge=1), limit: int = Query(12, ge=1, le=100)):
    """Get paginated gallery items (server-side pagination via Supabase)"""
    try:
        return admin_db.select_paginated(
            "gallery",
            order_by="created_at",
            ascending=False,
            page=page,
            limit=limit,
        )
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
    request: Request,
    title: str = Form(default=""),
    description: str = Form(default=""),
    image: Optional[UploadFile] = File(default=None),
    image_url: str = Form(default=""),
    current_user: dict = Depends(get_current_active_user),
) -> dict:
    """Create gallery item with image upload to Supabase Storage"""
    try:
        normalized_title = require_value(title, "Title")
        normalized_description = optional_value(description)

        image_url_value = None
        supabase = get_supabase_admin_client()
        if image and image.filename:
            content = image.file.read()
            allowed_types = ["image/jpeg", "image/png", "image/webp"]
            if image.content_type not in allowed_types:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
                )
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

        item_data = {
            "title": normalized_title,
            "description": normalized_description,
            "image_url": image_url_value,
        }

        created_item = admin_db.insert("gallery", item_data)

        log_action(
            request=request,
            current_user=current_user,
            action="CREATE",
            module="gallery",
            record_id=created_item.get("id"),
            new_data=created_item,
        )
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
    request: Request,
    current_user: dict = Depends(get_current_active_user),
) -> None:
    """Delete gallery item"""
    try:
        item = admin_db.select_one("gallery", {"id": item_id})
        count = admin_db.delete("gallery", {"id": item_id})
        if count == 0:
            raise HTTPException(status_code=404, detail="Gallery item not found")

        if item and item.get("image_url"):
            delete_storage_file("gallery", item["image_url"])

        log_action(
            request=request,
            current_user=current_user,
            action="DELETE",
            module="gallery",
            record_id=item_id,
            old_data=item,
        )
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting gallery item: {str(e)}")
