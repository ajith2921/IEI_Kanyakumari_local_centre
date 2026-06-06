"""
Login History — Read-Only (SUPER_ADMIN only)
"""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from auth import get_current_super_admin
from supabase_db import admin_db

router = APIRouter(prefix="/admin/login-logs", tags=["Login Logs"])


@router.get("")
def list_login_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    admin_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    _super: dict = Depends(get_current_super_admin),
):
    """Get paginated login history (SUPER_ADMIN only)."""
    try:
        query = admin_db.client.table("login_logs").select("*", count="exact")

        if admin_id:
            query = query.eq("admin_id", admin_id)
        if status:
            query = query.eq("status", status)

        query = query.order("login_time", desc=True)

        start = (page - 1) * limit
        end = start + limit - 1
        result = query.range(start, end).execute()

        total = result.count or 0
        pages = (total + limit - 1) // limit if limit > 0 else 0

        return {
            "items": result.data or [],
            "page": page,
            "limit": limit,
            "total": total,
            "pages": pages,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
