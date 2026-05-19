from pathlib import Path
from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from auth import get_current_active_user
from supabase_db import admin_db, get_supabase_admin_client
from schemas import FacilityOut
from routes.utils import optional_value, require_value

router = APIRouter(prefix="/facilities", tags=["Facilities"])


@router.get("", response_model=list[FacilityOut])
def list_facilities() -> list[dict]:
    """Get all facilities"""
    try:
        facilities = admin_db.order_by("facilities", "created_at", ascending=False)
        return facilities
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=FacilityOut, status_code=status.HTTP_201_CREATED)
def create_facility(
    name: str = Form(default=""),
    description: str = Form(default=""),
    image_url: str = Form(default=""),
    image: Optional[UploadFile] = File(default=None),
    _current_user = Depends(get_current_active_user),
) -> dict:
    """Create facility with image upload to Supabase Storage"""
    try:
        normalized_name = require_value(name, "Name")
        normalized_description = optional_value(description)

        image_url_value = None
        supabase = get_supabase_admin_client()
        # Upload image to Supabase Storage
        if image and image.filename:
            content = image.file.read()
            
            if len(content) > 10 * 1024 * 1024:  # 10MB max
                raise HTTPException(status_code=413, detail="Image too large. Max 10MB.")
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            img_path = f"facility_{timestamp}{Path(image.filename).suffix}"
            
            supabase.storage.from_("facilities").upload(
                path=img_path,
                file=content,
                file_options={"content-type": image.content_type or "image/jpeg"}
            )
            
            image_url_value = supabase.storage.from_("facilities").get_public_url(img_path)
        elif image_url.strip():
            image_url_value = image_url.strip()

        # Create facility in Supabase
        facility_data = {
            "name": normalized_name,
            "description": normalized_description,
            "image_url": image_url_value,
        }
        
        created_facility = admin_db.insert("facilities", facility_data)
        return created_facility
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating facility: {str(e)}")


@router.put("/{facility_id}", response_model=FacilityOut)
def update_facility(
    facility_id: int,
    name: str = Form(default=""),
    description: str = Form(default=""),
    image_url: str = Form(default=""),
    image: Optional[UploadFile] = File(default=None),
    _current_user = Depends(get_current_active_user),
) -> dict:
    """Update facility with optional image upload to Supabase Storage"""
    try:
        # Check facility exists
        facility = admin_db.select_one("facilities", {"id": facility_id})
        if not facility:
            raise HTTPException(status_code=404, detail="Facility not found")

        normalized_name = require_value(name, "Name")
        normalized_description = optional_value(description)

        update_data = {
            "name": normalized_name,
            "description": normalized_description,
        }
        supabase = get_supabase_admin_client()
        # Handle image upload
        if image and image.filename:
            content = image.file.read()
            if len(content) > 10 * 1024 * 1024:
                raise HTTPException(status_code=413, detail="Image too large. Max 10MB.")
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            img_path = f"facility_{facility_id}_{timestamp}{Path(image.filename).suffix}"
            
            supabase.storage.from_("facilities").upload(
                path=img_path,
                file=content,
                file_options={"content-type": image.content_type}
            )
            update_data["image_url"] = supabase.storage.from_("facilities").get_public_url(img_path)
        elif image_url.strip():
            update_data["image_url"] = image_url.strip()
        else:
            update_data["image_url"] = None

        # Update in Supabase
        updated_facility = admin_db.update("facilities", update_data, {"id": facility_id})
        return updated_facility
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating facility: {str(e)}")


@router.get("/{facility_id}", response_model=FacilityOut)
def get_facility(facility_id: int) -> dict:
    """Get single facility"""
    try:
        facility = admin_db.select_one("facilities", {"id": facility_id})
        if not facility:
            raise HTTPException(status_code=404, detail="Facility not found")
        return facility
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete(
    "/{facility_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
)
def delete_facility(
    facility_id: int,
    _current_user = Depends(get_current_active_user),
) -> None:
    """Delete facility"""
    try:
        count = admin_db.delete("facilities", {"id": facility_id})
        if count == 0:
            raise HTTPException(status_code=404, detail="Facility not found")
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting facility: {str(e)}")
