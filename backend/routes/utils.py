"""Shared utilities for all route modules."""
from typing import Optional

from fastapi import HTTPException


def require_value(value: str, field_label: str) -> str:
    """Strip and validate that a string field is non-empty."""
    cleaned = value.strip()
    if not cleaned:
        raise HTTPException(status_code=400, detail=f"{field_label} is required.")
    return cleaned


def optional_value(value: str) -> Optional[str]:
    """Return trimmed value, or None if empty."""
    cleaned = value.strip() if value else ""
    return cleaned or None


def paginate_results(items: list, page: int = 1, limit: int = 20) -> dict:
    """
    Paginate a list of items.
    
    Args:
        items: List of items to paginate
        page: Page number (1-indexed)
        limit: Items per page
    
    Returns:
        Dictionary with paginated results and metadata
    """
    page = max(1, int(page))
    limit = max(1, min(int(limit), 100))  # Cap at 100 items per page
    
    total = len(items)
    start = (page - 1) * limit
    end = start + limit
    
    paginated_items = items[start:end]
    total_pages = (total + limit - 1) // limit
    
    return {
        "items": paginated_items,
        "page": page,
        "limit": limit,
        "total": total,
        "pages": total_pages,
    }
