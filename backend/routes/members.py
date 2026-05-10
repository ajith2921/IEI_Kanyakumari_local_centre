from pathlib import Path
import re
from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from auth import get_current_active_user
from supabase_db import admin_db, get_supabase_admin_client
from schemas import MemberOut
from routes.utils import require_value

router = APIRouter(prefix="/members", tags=["Members"])
PHONE_PATTERN = re.compile(r"^[+]?[0-9\s()\-]{7,18}$")
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _require_email(value: str) -> str:
    cleaned = require_value(value, "Email")
    if not EMAIL_PATTERN.fullmatch(cleaned):
        raise HTTPException(status_code=400, detail="Please provide a valid email address.")
    return cleaned


def _optional_email(value: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        return ""
    if not EMAIL_PATTERN.fullmatch(cleaned):
        raise HTTPException(status_code=400, detail="Please provide a valid secondary email address.")
    return cleaned


def _combine_member_emails(primary_email: str, secondary_email: str) -> str:
    return f"{primary_email}, {secondary_email}" if secondary_email else primary_email


def _is_missing_secondary_email_column_error(exc: Exception) -> bool:
    message = str(exc).lower()
    return (
        "email_secondary" in message
        and (
            "does not exist" in message
            or "schema cache" in message
            or "column" in message
        )
    )


def _insert_member_with_secondary_fallback(member_data: dict, primary_email: str, secondary_email: str) -> dict:
    try:
        return admin_db.insert("members", member_data)
    except Exception as exc:
        if not _is_missing_secondary_email_column_error(exc):
            raise

        fallback_data = dict(member_data)
        fallback_data.pop("email_secondary", None)
        fallback_data["email"] = _combine_member_emails(primary_email, secondary_email)
        return admin_db.insert("members", fallback_data)


def _update_member_with_secondary_fallback(member_id: int, update_data: dict, primary_email: str, secondary_email: str) -> dict:
    try:
        return admin_db.update("members", update_data, {"id": member_id})
    except Exception as exc:
        if not _is_missing_secondary_email_column_error(exc):
            raise

        fallback_data = dict(update_data)
        fallback_data.pop("email_secondary", None)
        fallback_data["email"] = _combine_member_emails(primary_email, secondary_email)
        return admin_db.update("members", fallback_data, {"id": member_id})


def _require_mobile(value: str) -> str:
    cleaned = require_value(value, "Mobile")
    if not PHONE_PATTERN.fullmatch(cleaned):
        raise HTTPException(status_code=400, detail="Please provide a valid mobile number.")
    return cleaned


@router.get("", response_model=list[MemberOut])
def list_members() -> list[dict]:
    """Get all members"""
    try:
        members = admin_db.order_by("members", "created_at", ascending=False)
        return members
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{member_id}", response_model=MemberOut)
def get_member(member_id: int) -> dict:
    """Get single member"""
    try:
        member = admin_db.select_one("members", {"id": member_id})
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        return member
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=MemberOut, status_code=status.HTTP_201_CREATED)
def create_member(
    name: str = Form(...),
    position: str = Form(...),
    membership_id: str = Form(default=""),
    address: str = Form(...),
    email: str = Form(...),
    email_secondary: str = Form(default=""),
    mobile: str = Form(...),
    image_url: str = Form(default=""),
    image: Optional[UploadFile] = File(default=None),
    _current_user = Depends(get_current_active_user),
) -> dict:
    """Create new member with image upload to Supabase"""
    try:
        normalized_name = require_value(name, "Name")
        normalized_position = require_value(position, "Position")
        normalized_membership_id = membership_id.strip()
        normalized_address = require_value(address, "Address")
        normalized_email = _require_email(email)
        normalized_secondary_email = _optional_email(email_secondary)
        normalized_mobile = _require_mobile(mobile)

        if len(normalized_membership_id) > 80:
            raise HTTPException(status_code=400, detail="Membership ID is too long.")

        # Handle image upload to Supabase Storage
        final_image_url = image_url.strip() if image_url else ""
        supabase = get_supabase_admin_client()
        
        if image and image.filename:
            content = image.file.read()
            
            # Validate file type
            allowed_types = ["image/jpeg", "image/png", "image/webp"]
            if image.content_type not in allowed_types:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
                )
            
            # Validate file size (5MB max)
            if len(content) > 5 * 1024 * 1024:
                raise HTTPException(status_code=413, detail="File too large. Max 5MB.")
            
            # Upload to Supabase Storage
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            file_ext = Path(image.filename).suffix
            remote_path = f"member_{timestamp}{file_ext}"
            
            supabase.storage.from_("members").upload(
                path=remote_path,
                file=content,
                file_options={"content-type": image.content_type}
            )
            
            # Get public URL
            final_image_url = supabase.storage.from_("members").get_public_url(remote_path)

        # Create member in Supabase
        member_data = {
            "name": normalized_name,
            "position": normalized_position,
            "membership_id": normalized_membership_id,
            "address": normalized_address,
            "email": normalized_email,
            "email_secondary": normalized_secondary_email,
            "mobile": normalized_mobile,
            "image_url": final_image_url,
            "password_hash": "",
        }

        created_member = _insert_member_with_secondary_fallback(
            member_data, normalized_email, normalized_secondary_email
        )
        return created_member
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating member: {str(e)}")


@router.put("/{member_id}", response_model=MemberOut)
def update_member(
    member_id: int,
    name: str = Form(...),
    position: str = Form(...),
    membership_id: str = Form(default=""),
    address: str = Form(...),
    email: str = Form(...),
    email_secondary: str = Form(default=""),
    mobile: str = Form(...),
    image_url: str = Form(default=""),
    image: Optional[UploadFile] = File(default=None),
    _current_user = Depends(get_current_active_user),
) -> dict:
    """Update member with optional image upload to Supabase"""
    try:
        # Check member exists
        member = admin_db.select_one("members", {"id": member_id})
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")

        normalized_name = require_value(name, "Name")
        normalized_position = require_value(position, "Position")
        normalized_membership_id = membership_id.strip()
        normalized_address = require_value(address, "Address")
        normalized_email = _require_email(email)
        normalized_secondary_email = _optional_email(email_secondary)
        normalized_mobile = _require_mobile(mobile)

        if len(normalized_membership_id) > 80:
            raise HTTPException(status_code=400, detail="Membership ID is too long.")

        # Prepare update data
        update_data = {
            "name": normalized_name,
            "position": normalized_position,
            "membership_id": normalized_membership_id,
            "address": normalized_address,
            "email": normalized_email,
            "email_secondary": normalized_secondary_email,
            "mobile": normalized_mobile,
        }

        # Handle image upload if provided
        supabase = get_supabase_admin_client()
        if image and image.filename:
            content = image.file.read()
            
            # Validate file type
            allowed_types = ["image/jpeg", "image/png", "image/webp"]
            if image.content_type not in allowed_types:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
                )
            
            # Validate file size (5MB max)
            if len(content) > 5 * 1024 * 1024:
                raise HTTPException(status_code=413, detail="File too large. Max 5MB.")
            
            # Upload to Supabase Storage
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            file_ext = Path(image.filename).suffix
            remote_path = f"member_{member_id}_{timestamp}{file_ext}"
            
            supabase.storage.from_("members").upload(
                path=remote_path,
                file=content,
                file_options={"content-type": image.content_type}
            )
            
            # Get public URL
            image_url_value = supabase.storage.from_("members").get_public_url(remote_path)
            update_data["image_url"] = image_url_value
        elif image_url.strip():
            # Use provided image URL
            update_data["image_url"] = image_url.strip()

        # Update in Supabase
        updated_member = _update_member_with_secondary_fallback(
            member_id, update_data, normalized_email, normalized_secondary_email
        )
        return updated_member
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating member: {str(e)}")


@router.delete(
    "/{member_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
)
def delete_member(
    member_id: int,
    _current_user = Depends(get_current_active_user),
) -> None:
    """Delete member"""
    try:
        count = admin_db.delete("members", {"id": member_id})
        if count == 0:
            raise HTTPException(status_code=404, detail="Member not found")
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting member: {str(e)}")
