"""
Admin Users Management (SUPER_ADMIN only)
==========================================
CRUD for managing admin accounts.
Only SUPER_ADMIN can access any endpoint in this router.
"""
from __future__ import annotations

import re
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, field_validator

from auth import get_current_super_admin, hash_password, invalidate_user_cache
from supabase_db import admin_db

router = APIRouter(prefix="/admin/users", tags=["Admin Users"])

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
USERNAME_RE = re.compile(r"^[a-zA-Z0-9_]{3,50}$")


class AdminUserCreate(BaseModel):
    name: str
    username: str
    email: str
    password: str
    role: str = "ADMIN"

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        if v not in ("SUPER_ADMIN", "ADMIN"):
            raise ValueError("role must be SUPER_ADMIN or ADMIN")
        return v

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        if not USERNAME_RE.match(v):
            raise ValueError("username must be 3–50 alphanumeric/underscore characters")
        return v

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        if not EMAIL_RE.match(v):
            raise ValueError("Invalid email address")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class AdminUserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ("SUPER_ADMIN", "ADMIN"):
            raise ValueError("role must be SUPER_ADMIN or ADMIN")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ("active", "inactive", "suspended"):
            raise ValueError("status must be active, inactive, or suspended")
        return v


class PasswordReset(BaseModel):
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


def _safe_user(user: dict) -> dict:
    """Strip password hash before returning to frontend."""
    return {k: v for k, v in user.items() if k not in ("password_hash", "hashed_password")}


@router.get("")
def list_admin_users(
    _super: dict = Depends(get_current_super_admin),
):
    """List all admin users (SUPER_ADMIN only)."""
    try:
        users = admin_db.select("admin_users")
        return [_safe_user(u) for u in users]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}")
def get_admin_user(
    user_id: int,
    _super: dict = Depends(get_current_super_admin),
):
    """Get single admin user (SUPER_ADMIN only)."""
    user = admin_db.select_one("admin_users", {"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Admin user not found")
    return _safe_user(user)


@router.post("", status_code=status.HTTP_201_CREATED)
def create_admin_user(
    request: Request,
    payload: AdminUserCreate,
    current_super: dict = Depends(get_current_super_admin),
):
    """Create a new admin user (SUPER_ADMIN only)."""
    # Check uniqueness
    if admin_db.select_one("admin_users", {"username": payload.username}):
        raise HTTPException(status_code=409, detail="Username already taken")
    if admin_db.select_one("admin_users", {"email": payload.email}):
        raise HTTPException(status_code=409, detail="Email already registered")

    try:
        data = {
            "name": payload.name.strip(),
            "username": payload.username.strip(),
            "email": payload.email.strip().lower(),
            "password_hash": hash_password(payload.password),
            "role": payload.role,
            "status": "active",
            "created_by": current_super.get("id"),
        }
        created = admin_db.insert("admin_users", data)

        # Audit log
        from audit import log_action
        log_action(
            request=request,
            current_user=current_super,
            action="CREATE",
            module="admin_users",
            record_id=created.get("id"),
            new_data=_safe_user(created),
        )
        return _safe_user(created)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating admin user: {e}")


@router.put("/{user_id}")
def update_admin_user(
    user_id: int,
    request: Request,
    payload: AdminUserUpdate,
    current_super: dict = Depends(get_current_super_admin),
):
    """Update admin user details (SUPER_ADMIN only)."""
    existing = admin_db.select_one("admin_users", {"id": user_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Admin user not found")

    # Prevent demoting self
    if user_id == current_super.get("id") and payload.role and payload.role != "SUPER_ADMIN":
        raise HTTPException(status_code=400, detail="You cannot demote your own account.")

    # Prevent deactivating self
    if user_id == current_super.get("id") and payload.status and payload.status != "active":
        raise HTTPException(status_code=400, detail="You cannot deactivate your own account.")

    update_data = {}
    if payload.name is not None:
        update_data["name"] = payload.name.strip()
    if payload.email is not None:
        if not EMAIL_RE.match(payload.email):
            raise HTTPException(status_code=400, detail="Invalid email address")
        update_data["email"] = payload.email.strip().lower()
    if payload.role is not None:
        update_data["role"] = payload.role
    if payload.status is not None:
        update_data["status"] = payload.status
        update_data["is_active"] = payload.status == "active"

    if not update_data:
        return _safe_user(existing)

    try:
        updated = admin_db.update("admin_users", update_data, {"id": user_id})
        invalidate_user_cache(existing.get("username", ""))

        from audit import log_action
        log_action(
            request=request,
            current_user=current_super,
            action="UPDATE",
            module="admin_users",
            record_id=user_id,
            old_data=_safe_user(existing),
            new_data=_safe_user(updated),
        )
        return _safe_user(updated)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating admin user: {e}")


@router.post("/{user_id}/reset-password")
def reset_admin_password(
    user_id: int,
    request: Request,
    payload: PasswordReset,
    current_super: dict = Depends(get_current_super_admin),
):
    """Reset admin user password (SUPER_ADMIN only)."""
    existing = admin_db.select_one("admin_users", {"id": user_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Admin user not found")

    try:
        admin_db.update(
            "admin_users",
            {"password_hash": hash_password(payload.new_password)},
            {"id": user_id},
        )
        invalidate_user_cache(existing.get("username", ""))

        from audit import log_action
        log_action(
            request=request,
            current_user=current_super,
            action="UPDATE",
            module="admin_users",
            record_id=user_id,
            new_data={"action": "password_reset", "target_user": existing.get("username")},
        )
        return {"message": "Password reset successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error resetting password: {e}")


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin_user(
    user_id: int,
    request: Request,
    current_super: dict = Depends(get_current_super_admin),
):
    """Delete admin user (SUPER_ADMIN only). Cannot delete self."""
    if user_id == current_super.get("id"):
        raise HTTPException(status_code=400, detail="You cannot delete your own account.")

    existing = admin_db.select_one("admin_users", {"id": user_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Admin user not found")

    # Prevent deleting the last SUPER_ADMIN
    super_admins = admin_db.select("admin_users", filters={"role": "SUPER_ADMIN", "status": "active"})
    if existing.get("role") == "SUPER_ADMIN" and len(super_admins) <= 1:
        raise HTTPException(status_code=400, detail="Cannot delete the last SUPER_ADMIN account.")

    try:
        admin_db.delete("admin_users", {"id": user_id})
        invalidate_user_cache(existing.get("username", ""))

        from audit import log_action
        log_action(
            request=request,
            current_user=current_super,
            action="DELETE",
            module="admin_users",
            record_id=user_id,
            old_data=_safe_user(existing),
        )
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting admin user: {e}")
