from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO
from pathlib import Path
from typing import Any
from urllib.error import URLError
from urllib.request import Request, urlopen

from fastapi import APIRouter, Depends, HTTPException
from PIL import Image, ImageOps
from sqlalchemy.orm import Session

from auth import get_current_active_user
from database import get_db
from models import Activity, Facility, GalleryItem, Member, User
from routes.file_utils import (
    delete_local_upload_if_exists,
    resolve_local_upload_path,
    save_optimized_local_image_path,
)

router = APIRouter(prefix="/image-audit", tags=["Image Audit"])
BASE_UPLOAD_DIR = Path(__file__).resolve().parents[1] / "uploads"
MAX_REMOTE_IMAGE_BYTES = 10 * 1024 * 1024


@dataclass(frozen=True)
class AuditTarget:
    model: Any
    label_field: str
    sub_folder: str
    target_size: tuple[int, int]
    crop_center: tuple[float, float]


AUDIT_TARGETS: dict[str, AuditTarget] = {
    "members": AuditTarget(
        model=Member,
        label_field="name",
        sub_folder="members",
        target_size=(400, 400),
        crop_center=(0.5, 0.3),
    ),
    "activities": AuditTarget(
        model=Activity,
        label_field="title",
        sub_folder="activities",
        target_size=(400, 300),
        crop_center=(0.5, 0.5),
    ),
    "facilities": AuditTarget(
        model=Facility,
        label_field="name",
        sub_folder="facilities",
        target_size=(400, 300),
        crop_center=(0.5, 0.5),
    ),
    "gallery": AuditTarget(
        model=GalleryItem,
        label_field="title",
        sub_folder="gallery",
        target_size=(800, 600),
        crop_center=(0.5, 0.5),
    ),
}


def _load_dimensions_from_local(path: Path) -> tuple[int, int]:
    with Image.open(path) as image:
        normalized = ImageOps.exif_transpose(image)
        return int(normalized.width), int(normalized.height)


def _load_dimensions_from_remote(url: str) -> tuple[int, int]:
    request = Request(url, headers={"User-Agent": "IEI-Image-Audit/1.0"})
    try:
        with urlopen(request, timeout=8) as response:
            payload = response.read(MAX_REMOTE_IMAGE_BYTES + 1)
    except URLError as exc:  # pragma: no cover - network-dependent
        raise ValueError("Remote image could not be reached.") from exc

    if len(payload) > MAX_REMOTE_IMAGE_BYTES:
        raise ValueError("Remote image is too large to inspect.")

    try:
        with Image.open(BytesIO(payload)) as image:
            normalized = ImageOps.exif_transpose(image)
            return int(normalized.width), int(normalized.height)
    except Exception as exc:  # pragma: no cover - defensive validation
        raise ValueError("Remote image is not a valid image.") from exc


def _analyze_dimensions(
    entity: str,
    width: int,
    height: int,
    target_size: tuple[int, int],
    source: str,
) -> dict[str, Any]:
    target_width, target_height = target_size
    target_ratio = target_width / target_height
    current_ratio = (width / height) if height else 0
    ratio_delta = abs(current_ratio - target_ratio)

    issues: list[str] = []
    severity_rank = 0

    if ratio_delta > 0.22:
        issues.append("wrong_ratio")
        severity_rank = max(severity_rank, 3)
    elif ratio_delta > 0.12:
        issues.append("ratio_drift")
        severity_rank = max(severity_rank, 2)

    if width < target_width or height < target_height:
        issues.append("low_resolution")
        severity_rank = max(severity_rank, 2)

    if entity == "members":
        if current_ratio > 1.4:
            issues.append("face_crop_risk_wide")
            severity_rank = max(severity_rank, 3)
        elif current_ratio < 0.75:
            issues.append("face_crop_risk_tall")
            severity_rank = max(severity_rank, 2)

    severity = {0: "none", 1: "low", 2: "medium", 3: "high"}.get(severity_rank, "medium")

    suggestions: list[str] = []
    if "wrong_ratio" in issues or "ratio_drift" in issues:
        suggestions.append(f"Re-upload near {target_width}x{target_height} for clean card framing.")
    if "low_resolution" in issues:
        suggestions.append(f"Use a higher-resolution image (at least {target_width}x{target_height}).")
    if "face_crop_risk_wide" in issues or "face_crop_risk_tall" in issues:
        suggestions.append("Portrait framing may cut faces; upload a centered face image with extra headroom.")
    if source == "local" and issues:
        suggestions.append("Auto-fix is available for this local upload.")

    return {
        "width": width,
        "height": height,
        "ratio": round(current_ratio, 3),
        "target_ratio": round(target_ratio, 3),
        "issues": issues,
        "severity": severity,
        "suggestion": " ".join(suggestions),
    }


def _build_issue_item(entity: str, record: Any, target: AuditTarget) -> dict[str, Any]:
    image_url = str(getattr(record, "image_url", "") or "")
    label = str(getattr(record, target.label_field, "") or "Untitled")

    if not image_url:
        return {
            "entity": entity,
            "id": record.id,
            "label": label,
            "image_url": "",
            "source": "missing",
            "issues": ["missing_image"],
            "severity": "medium",
            "suggestion": "Add an image to keep cards visually consistent.",
            "auto_fix_available": False,
        }

    local_path = resolve_local_upload_path(image_url, BASE_UPLOAD_DIR)
    source = "local" if local_path else "remote"

    try:
        if local_path:
            if not local_path.exists():
                raise ValueError("Local image file is missing.")
            width, height = _load_dimensions_from_local(local_path)
        else:
            width, height = _load_dimensions_from_remote(image_url)
    except ValueError as exc:
        return {
            "entity": entity,
            "id": record.id,
            "label": label,
            "image_url": image_url,
            "source": source,
            "issues": ["image_unreadable"],
            "severity": "high",
            "suggestion": f"Re-upload image. Details: {exc}",
            "auto_fix_available": False,
        }

    analysis = _analyze_dimensions(entity, width, height, target.target_size, source)
    return {
        "entity": entity,
        "id": record.id,
        "label": label,
        "image_url": image_url,
        "source": source,
        "issues": analysis["issues"],
        "severity": analysis["severity"],
        "suggestion": analysis["suggestion"],
        "width": analysis["width"],
        "height": analysis["height"],
        "ratio": analysis["ratio"],
        "target_ratio": analysis["target_ratio"],
        "auto_fix_available": bool(local_path and analysis["issues"]),
    }


@router.get("")
def audit_images(
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> dict[str, Any]:
    scanned = 0
    flagged_items: list[dict[str, Any]] = []

    for entity, target in AUDIT_TARGETS.items():
        records = db.query(target.model).order_by(target.model.id.desc()).all()
        for record in records:
            scanned += 1
            result = _build_issue_item(entity, record, target)
            if result["issues"]:
                flagged_items.append(result)

    severity_order = {"high": 0, "medium": 1, "low": 2, "none": 3}
    flagged_items.sort(key=lambda item: severity_order.get(item["severity"], 4))

    summary = {
        entity: sum(1 for item in flagged_items if item["entity"] == entity)
        for entity in AUDIT_TARGETS
    }

    return {
        "scanned": scanned,
        "flagged_count": len(flagged_items),
        "summary": summary,
        "items": flagged_items,
    }


@router.post("/auto-fix/{entity}/{item_id}")
def auto_fix_image(
    entity: str,
    item_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> dict[str, Any]:
    target = AUDIT_TARGETS.get(entity)
    if not target:
        raise HTTPException(status_code=404, detail="Unknown image entity.")

    record = db.query(target.model).filter(target.model.id == item_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Item not found.")

    current_image_url = str(getattr(record, "image_url", "") or "")
    local_path = resolve_local_upload_path(current_image_url, BASE_UPLOAD_DIR)

    if not local_path:
        raise HTTPException(status_code=400, detail="Auto-fix works only for local uploaded images.")

    try:
        next_image_url = save_optimized_local_image_path(
            local_path,
            BASE_UPLOAD_DIR,
            target.sub_folder,
            target.target_size,
            crop_center=target.crop_center,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    delete_local_upload_if_exists(current_image_url, BASE_UPLOAD_DIR)
    setattr(record, "image_url", next_image_url)

    db.commit()
    db.refresh(record)

    return {
        "message": "Image auto-fixed successfully.",
        "entity": entity,
        "id": item_id,
        "image_url": next_image_url,
    }
