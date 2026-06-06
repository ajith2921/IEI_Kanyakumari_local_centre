from pathlib import Path
import re
from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Request, UploadFile, status

from auth import get_current_active_user
from supabase_db import admin_db, get_supabase_admin_client
from schemas import MemberOut
from routes.utils import require_value, paginate_results
from audit import log_action

router = APIRouter(prefix="/members", tags=["Members"])
PHONE_PATTERN = re.compile(r"^[+]?[0-9\s()\-]{7,18}$")
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _require_email(value: str) -> str:
    cleaned = require_value(value, "Email")
    if not EMAIL_PATTERN.fullmatch(cleaned):
        raise HTTPException(status_code=400, detail="Please provide a valid email address.")
    return cleaned


def _optional_email(value: str) -> Optional[str]:
    cleaned = value.strip()
    if not cleaned:
        return None
    if not EMAIL_PATTERN.fullmatch(cleaned):
        raise HTTPException(status_code=400, detail="Please provide a valid secondary email address.")
    return cleaned


def _combine_member_emails(primary_email: Optional[str], secondary_email: Optional[str]) -> Optional[str]:
    parts = [part for part in [primary_email, secondary_email] if part]
    if not parts:
        return None
    return ", ".join(parts)


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


def _insert_member_with_secondary_fallback(
    member_data: dict,
    primary_email: Optional[str],
    secondary_email: Optional[str],
) -> dict:
    try:
        return admin_db.insert("members", member_data)
    except Exception as exc:
        if not _is_missing_secondary_email_column_error(exc):
            raise

        fallback_data = dict(member_data)
        fallback_data.pop("email_secondary", None)
        fallback_data["email"] = _combine_member_emails(primary_email, secondary_email)
        return admin_db.insert("members", fallback_data)


def _update_member_with_secondary_fallback(
    member_id: int,
    update_data: dict,
    primary_email: Optional[str],
    secondary_email: Optional[str],
) -> dict:
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


def _optional_phone(value: str) -> Optional[str]:
    """Validate phone number if provided, otherwise return None"""
    cleaned = value.strip()
    if not cleaned:
        return None
    if not PHONE_PATTERN.fullmatch(cleaned):
        raise HTTPException(status_code=400, detail="Please provide a valid mobile number.")
    return cleaned


def _optional_value(value: str) -> Optional[str]:
    """Return trimmed value, or None if not provided"""
    cleaned = value.strip() if value else ""
    return cleaned or None


@router.get("")
def list_members(page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100)):
    """Get paginated list of members (server-side pagination via Supabase)"""
    try:
        result = admin_db.select_paginated(
            "members",
            order_by="created_at",
            ascending=False,
            page=page,
            limit=limit,
        )
        # Normalize created_at to string for JSON serialization
        result["items"] = [
            {**m, "created_at": str(m["created_at"])} if m.get("created_at") else m
            for m in result["items"]
        ]
        return result
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
    request: Request,
    name: str = Form(default=""),
    position: str = Form(default=""),
    membership_id: str = Form(default=""),
    address: str = Form(default=""),
    email: str = Form(default=""),
    email_secondary: str = Form(default=""),
    mobile: str = Form(default=""),
    image_url: str = Form(default=""),
    image: Optional[UploadFile] = File(default=None),
    current_user: dict = Depends(get_current_active_user),
) -> dict:
    """Create new member with image upload to Supabase - allows partial data entry"""
    try:
        normalized_name = require_value(name, "Name")
        normalized_position = require_value(position, "Position")
        normalized_membership_id = _optional_value(membership_id)
        normalized_address = _optional_value(address)
        normalized_email = _optional_email(email)
        normalized_secondary_email = _optional_email(email_secondary)
        normalized_mobile = _optional_phone(mobile)

        if normalized_membership_id and len(normalized_membership_id) > 80:
            raise HTTPException(status_code=400, detail="Membership ID is too long.")

        final_image_url = image_url.strip() if image_url and image_url.strip() else None
        supabase = get_supabase_admin_client()

        if image and image.filename:
            content = image.file.read()
            allowed_types = ["image/jpeg", "image/png", "image/webp"]
            if image.content_type not in allowed_types:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
                )
            if len(content) > 5 * 1024 * 1024:
                raise HTTPException(status_code=413, detail="File too large. Max 5MB.")
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            file_ext = Path(image.filename).suffix
            remote_path = f"member_{timestamp}{file_ext}"
            supabase.storage.from_("members").upload(
                path=remote_path,
                file=content,
                file_options={"content-type": image.content_type}
            )
            final_image_url = supabase.storage.from_("members").get_public_url(remote_path)

        member_data = {
            "name": normalized_name,
            "position": normalized_position,
            "membership_id": normalized_membership_id,
            "address": normalized_address,
            "email": normalized_email,
            "email_secondary": normalized_secondary_email,
            "mobile": normalized_mobile,
            "image_url": final_image_url,
        }

        created_member = _insert_member_with_secondary_fallback(
            member_data, normalized_email, normalized_secondary_email
        )

        # Audit log
        log_action(
            request=request,
            current_user=current_user,
            action="CREATE",
            module="members",
            record_id=created_member.get("id"),
            new_data=created_member,
        )
        return created_member

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating member: {str(e)}")


@router.put("/{member_id}", response_model=MemberOut)
def update_member(
    member_id: int,
    request: Request,
    name: str = Form(default=""),
    position: str = Form(default=""),
    membership_id: str = Form(default=""),
    address: str = Form(default=""),
    email: str = Form(default=""),
    email_secondary: str = Form(default=""),
    mobile: str = Form(default=""),
    image_url: str = Form(default=""),
    image: Optional[UploadFile] = File(default=None),
    current_user: dict = Depends(get_current_active_user),
) -> dict:
    """Update member with optional image upload to Supabase - allows partial data"""
    try:
        member = admin_db.select_one("members", {"id": member_id})
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")

        normalized_name = require_value(name, "Name")
        normalized_position = require_value(position, "Position")
        normalized_membership_id = _optional_value(membership_id)
        normalized_address = _optional_value(address)
        normalized_email = _optional_email(email)
        normalized_secondary_email = _optional_email(email_secondary)
        normalized_mobile = _optional_phone(mobile)

        if normalized_membership_id and len(normalized_membership_id) > 80:
            raise HTTPException(status_code=400, detail="Membership ID is too long.")

        update_data = {
            "name": normalized_name,
            "position": normalized_position,
            "membership_id": normalized_membership_id,
            "address": normalized_address,
            "email": normalized_email,
            "email_secondary": normalized_secondary_email,
            "mobile": normalized_mobile,
        }

        supabase = get_supabase_admin_client()
        if image and image.filename:
            content = image.file.read()
            allowed_types = ["image/jpeg", "image/png", "image/webp"]
            if image.content_type not in allowed_types:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
                )
            if len(content) > 5 * 1024 * 1024:
                raise HTTPException(status_code=413, detail="File too large. Max 5MB.")
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            file_ext = Path(image.filename).suffix
            remote_path = f"member_{member_id}_{timestamp}{file_ext}"
            supabase.storage.from_("members").upload(
                path=remote_path,
                file=content,
                file_options={"content-type": image.content_type}
            )
            image_url_value = supabase.storage.from_("members").get_public_url(remote_path)
            update_data["image_url"] = image_url_value
        elif image_url.strip():
            update_data["image_url"] = image_url.strip()
        elif "image_url" not in update_data:
            update_data["image_url"] = None

        updated_member = _update_member_with_secondary_fallback(
            member_id, update_data, normalized_email, normalized_secondary_email
        )

        # Audit log
        log_action(
            request=request,
            current_user=current_user,
            action="UPDATE",
            module="members",
            record_id=member_id,
            old_data=member,
            new_data=updated_member,
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
    request: Request,
    current_user: dict = Depends(get_current_active_user),
) -> None:
    """Delete member"""
    try:
        member = admin_db.select_one("members", {"id": member_id})
        count = admin_db.delete("members", {"id": member_id})
        if count == 0:
            raise HTTPException(status_code=404, detail="Member not found")

        # Audit log
        log_action(
            request=request,
            current_user=current_user,
            action="DELETE",
            module="members",
            record_id=member_id,
            old_data=member,
        )
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting member: {str(e)}")
