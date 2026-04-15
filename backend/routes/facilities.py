from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from auth import get_current_active_user
from database import get_db
from models import Facility, User
from routes.file_utils import (
    delete_local_upload_if_exists,
    normalize_remote_image_url,
    save_optimized_image_file,
)
from schemas import FacilityOut

router = APIRouter(prefix="/facilities", tags=["Facilities"])
BASE_UPLOAD_DIR = Path(__file__).resolve().parents[1] / "uploads"
IMAGE_TYPES = {".jpg", ".jpeg", ".png", ".webp"}
CARD_IMAGE_SIZE = (400, 300)


def _require_value(value: str, field_label: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        raise HTTPException(status_code=400, detail=f"{field_label} is required.")
    return cleaned


@router.get("", response_model=list[FacilityOut])
def list_facilities(db: Session = Depends(get_db)) -> list[Facility]:
    return db.query(Facility).order_by(Facility.created_at.desc()).all()


@router.post("", response_model=FacilityOut, status_code=status.HTTP_201_CREATED)
def create_facility(
    name: str = Form(...),
    description: str = Form(default=""),
    image_url: str = Form(default=""),
    image: Optional[UploadFile] = File(default=None),
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> Facility:
    normalized_name = _require_value(name, "Name")
    normalized_description = description.strip()

    selected_file = image if image and image.filename else None

    try:
        normalized_url = normalize_remote_image_url(image_url)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if selected_file:
        try:
            image_url_value = save_optimized_image_file(
                selected_file,
                BASE_UPLOAD_DIR,
                "facilities",
                IMAGE_TYPES,
                CARD_IMAGE_SIZE,
            )
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
    else:
        image_url_value = normalized_url

    facility = Facility(
        name=normalized_name,
        description=normalized_description,
        image_url=image_url_value,
    )
    db.add(facility)
    db.commit()
    db.refresh(facility)
    return facility


@router.put("/{facility_id}", response_model=FacilityOut)
def update_facility(
    facility_id: int,
    name: str = Form(...),
    description: str = Form(default=""),
    image_url: str = Form(default=""),
    image: Optional[UploadFile] = File(default=None),
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> Facility:
    facility = db.query(Facility).filter(Facility.id == facility_id).first()
    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found")

    normalized_name = _require_value(name, "Name")
    normalized_description = description.strip()

    selected_file = image if image and image.filename else None

    try:
        normalized_url = normalize_remote_image_url(image_url)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    facility.name = normalized_name
    facility.description = normalized_description

    if selected_file:
        try:
            next_image_url = save_optimized_image_file(
                selected_file,
                BASE_UPLOAD_DIR,
                "facilities",
                IMAGE_TYPES,
                CARD_IMAGE_SIZE,
            )
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

        delete_local_upload_if_exists(facility.image_url, BASE_UPLOAD_DIR)
        facility.image_url = next_image_url
    else:
        facility.image_url = normalized_url

    db.commit()
    db.refresh(facility)
    return facility


@router.delete(
    "/{facility_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
)
def delete_facility(
    facility_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> None:
    facility = db.query(Facility).filter(Facility.id == facility_id).first()
    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found")

    delete_local_upload_if_exists(facility.image_url, BASE_UPLOAD_DIR)
    db.delete(facility)
    db.commit()
