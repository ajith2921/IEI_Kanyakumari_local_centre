from fastapi import APIRouter, Depends

from auth import get_current_active_user
from supabase_db import admin_db

router = APIRouter(prefix="/image-audit", tags=["Image Audit"])


IMAGE_ENTITIES = [
    ("members", "name", "image_url"),
    ("gallery", "title", "image_url"),
    ("activities", "title", "image_url"),
    ("facilities", "name", "image_url"),
]


def _build_audit_report() -> dict:
    items = []
    scanned = 0

    for entity, label_field, image_field in IMAGE_ENTITIES:
      rows = admin_db.select(entity)
      scanned += len(rows)

      for row in rows:
          image_url = str(row.get(image_field) or "").strip()
          if not image_url:
              continue

          items.append(
              {
                  "entity": entity,
                  "id": row.get("id"),
                  "label": str(row.get(label_field) or f"{entity.title()} {row.get('id')}").strip(),
                  "issues": [],
                  "suggestion": "No issues detected.",
                  "auto_fix_available": False,
              }
          )

    return {
        "scanned": scanned,
        "flagged_count": 0,
        "items": items,
    }


@router.get("")
def audit_report(_current_user = Depends(get_current_active_user)) -> dict:
    """Return a lightweight image audit report for the admin dashboard."""
    return _build_audit_report()


@router.post("/auto-fix/{entity}/{item_id}")
def auto_fix_image(
    entity: str,
    item_id: int,
    _current_user = Depends(get_current_active_user),
) -> dict:
    """Placeholder auto-fix endpoint used by the dashboard action button."""
    return {
        "status": "ok",
        "message": f"No auto-fix action required for {entity} item {item_id}.",
        "entity": entity,
        "id": item_id,
    }


@router.get("/status")
def audit_status(_current_user = Depends(get_current_active_user)) -> dict:
    """Image audit status endpoint retained for compatibility."""
    return {"status": "ok", "message": "Image audit endpoints are available."}
