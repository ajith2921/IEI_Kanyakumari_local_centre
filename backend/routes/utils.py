"""Shared utilities for all route modules."""
from fastapi import HTTPException


def require_value(value: str, field_label: str) -> str:
    """Strip and validate that a string field is non-empty."""
    cleaned = value.strip()
    if not cleaned:
        raise HTTPException(status_code=400, detail=f"{field_label} is required.")
    return cleaned
