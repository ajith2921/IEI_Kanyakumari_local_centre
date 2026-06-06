"""
Audit Logs — Read-Only + Export (SUPER_ADMIN only)
"""
from __future__ import annotations

import csv
import io
import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse

from auth import get_current_super_admin
from supabase_db import admin_db

router = APIRouter(prefix="/admin/audit-logs", tags=["Audit Logs"])


def _paginated_logs(
    page: int,
    limit: int,
    admin_id: Optional[int] = None,
    action: Optional[str] = None,
    module: Optional[str] = None,
):
    """Query audit_logs with optional filters."""
    query = admin_db.client.table("audit_logs").select("*", count="exact")

    if admin_id:
        query = query.eq("admin_id", admin_id)
    if action:
        query = query.eq("action", action)
    if module:
        query = query.eq("module", module)

    query = query.order("created_at", desc=True)

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


@router.get("")
def list_audit_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    admin_id: Optional[int] = Query(None),
    action: Optional[str] = Query(None),
    module: Optional[str] = Query(None),
    _super: dict = Depends(get_current_super_admin),
):
    """Get paginated audit logs (SUPER_ADMIN only)."""
    try:
        return _paginated_logs(page, limit, admin_id, action, module)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export")
def export_audit_logs(
    fmt: str = Query("csv", regex="^(csv|json)$"),
    admin_id: Optional[int] = Query(None),
    action: Optional[str] = Query(None),
    module: Optional[str] = Query(None),
    _super: dict = Depends(get_current_super_admin),
):
    """Export audit logs as CSV or JSON (SUPER_ADMIN only). Max 10,000 rows."""
    try:
        # Fetch up to 10,000 rows for export
        query = admin_db.client.table("audit_logs").select("*")
        if admin_id:
            query = query.eq("admin_id", admin_id)
        if action:
            query = query.eq("action", action)
        if module:
            query = query.eq("module", module)

        result = query.order("created_at", desc=True).limit(10000).execute()
        rows = result.data or []

        if fmt == "json":
            content = json.dumps(rows, indent=2, default=str)
            return StreamingResponse(
                io.BytesIO(content.encode()),
                media_type="application/json",
                headers={"Content-Disposition": "attachment; filename=audit_logs.json"},
            )

        # CSV
        output = io.StringIO()
        if rows:
            writer = csv.DictWriter(output, fieldnames=list(rows[0].keys()))
            writer.writeheader()
            for row in rows:
                # Flatten JSONB fields for CSV
                flat_row = {}
                for k, v in row.items():
                    if isinstance(v, (dict, list)):
                        flat_row[k] = json.dumps(v)
                    else:
                        flat_row[k] = v
                writer.writerow(flat_row)

        return StreamingResponse(
            io.BytesIO(output.getvalue().encode()),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=audit_logs.csv"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
