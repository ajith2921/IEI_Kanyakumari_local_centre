"""
Audit Logging Helper
====================
Fire-and-forget helper for writing immutable audit log entries.
A failure to log NEVER blocks the calling operation.

Usage:
    from audit import log_action

    log_action(
        request=request,
        current_user=current_user,
        action="CREATE",
        module="members",
        record_id=member["id"],
        new_data=member,
    )
"""

from __future__ import annotations

import json
from typing import Any, Optional

from fastapi import Request


def _get_ip(request: Request) -> str:
    """Extract real IP from request, honouring X-Forwarded-For."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host or ""
    return ""


def _get_user_agent(request: Request) -> str:
    return request.headers.get("User-Agent", "")


def _safe_json(data: Any) -> Optional[dict]:
    """Convert arbitrary data to a JSON-safe dict."""
    if data is None:
        return None
    if isinstance(data, dict):
        try:
            json.dumps(data)  # validate it's serialisable
            return data
        except (TypeError, ValueError):
            return {"_raw": str(data)}
    try:
        return {"value": str(data)}
    except Exception:
        return None


def log_action(
    request: Request,
    current_user: dict,
    action: str,
    module: str,
    record_id: Optional[int] = None,
    old_data: Optional[dict] = None,
    new_data: Optional[dict] = None,
) -> None:
    """
    Write an audit log entry. Safe to call from any route.
    Failures are silently swallowed — never raises.
    """
    try:
        # Import here to avoid circular imports
        from supabase_db import admin_db

        entry = {
            "admin_id": current_user.get("id"),
            "admin_name": current_user.get("name") or current_user.get("username", ""),
            "role": current_user.get("role", ""),
            "action": action,
            "module": module,
            "record_id": record_id,
            "old_data": _safe_json(old_data),
            "new_data": _safe_json(new_data),
            "ip_address": _get_ip(request),
            "user_agent": _get_user_agent(request),
        }
        admin_db.insert("audit_logs", entry)
    except Exception as exc:
        # Never let a logging failure crash the main operation
        print(f"[audit] WARNING: failed to write audit log: {exc}")


def log_login(
    *,
    request: Request,
    admin_id: Optional[int],
    admin_name: str,
    status: str = "success",
) -> Optional[int]:
    """
    Write a login log entry. Returns the login_log id (for later logout update).
    Returns None on failure.
    """
    try:
        from supabase_db import admin_db

        entry = {
            "admin_id": admin_id,
            "admin_name": admin_name,
            "ip_address": _get_ip(request),
            "browser": _get_user_agent(request),
            "device": "",
            "status": status,
        }
        result = admin_db.insert("login_logs", entry)
        return result.get("id")
    except Exception as exc:
        print(f"[audit] WARNING: failed to write login log: {exc}")
        return None


def log_logout(*, login_log_id: int) -> None:
    """
    Update the login log entry with logout time.
    """
    try:
        from supabase_db import admin_db
        from datetime import datetime, timezone

        admin_db.update(
            "login_logs",
            {"logout_time": datetime.now(timezone.utc).isoformat(), "status": "logout"},
            {"id": login_log_id},
        )
    except Exception as exc:
        print(f"[audit] WARNING: failed to update logout time: {exc}")
