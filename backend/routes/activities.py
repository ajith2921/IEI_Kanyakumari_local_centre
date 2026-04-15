from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from auth import get_current_active_user
from database import get_db
from models import Activity, User
from routes.file_utils import (
    delete_local_upload_if_exists,
    normalize_remote_image_url,
    save_optimized_image_file,
)
from schemas import ActivityOut

router = APIRouter(prefix="/activities", tags=["Activities"])
BASE_UPLOAD_DIR = Path(__file__).resolve().parents[1] / "uploads"
IMAGE_TYPES = {".jpg", ".jpeg", ".png", ".webp"}
CARD_IMAGE_SIZE = (400, 300)


def _require_value(value: str, field_label: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        raise HTTPException(status_code=400, detail=f"{field_label} is required.")
    return cleaned


@router.get("", response_model=list[ActivityOut])
def list_activities(db: Session = Depends(get_db)) -> list[Activity]:
    return db.query(Activity).order_by(Activity.created_at.desc()).all()


@router.post("", response_model=ActivityOut, status_code=status.HTTP_201_CREATED)
def create_activity(
    title: str = Form(...),
    description: str = Form(default=""),
    event_date: str = Form(default=""),
    image_url: str = Form(default=""),
    image: Optional[UploadFile] = File(default=None),
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> Activity:
    normalized_title = _require_value(title, "Title")
    normalized_description = description.strip()
    normalized_event_date = event_date.strip()

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
                "activities",
                IMAGE_TYPES,
                CARD_IMAGE_SIZE,
            )
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
    else:
        image_url_value = normalized_url

    activity = Activity(
        title=normalized_title,
        description=normalized_description,
        event_date=normalized_event_date,
        image_url=image_url_value,
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


@router.put("/{activity_id}", response_model=ActivityOut)
def update_activity(
    activity_id: int,
    title: str = Form(...),
    description: str = Form(default=""),
    event_date: str = Form(default=""),
    image_url: str = Form(default=""),
    image: Optional[UploadFile] = File(default=None),
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> Activity:
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    normalized_title = _require_value(title, "Title")
    normalized_description = description.strip()
    normalized_event_date = event_date.strip()

    selected_file = image if image and image.filename else None

    try:
        normalized_url = normalize_remote_image_url(image_url)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    activity.title = normalized_title
    activity.description = normalized_description
    activity.event_date = normalized_event_date

    if selected_file:
        try:
            next_image_url = save_optimized_image_file(
                selected_file,
                BASE_UPLOAD_DIR,
                "activities",
                IMAGE_TYPES,
                CARD_IMAGE_SIZE,
            )
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

        delete_local_upload_if_exists(activity.image_url, BASE_UPLOAD_DIR)
        activity.image_url = next_image_url
    else:
        activity.image_url = normalized_url

    db.commit()
    db.refresh(activity)
    return activity


@router.delete(
    "/{activity_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
)
def delete_activity(
    activity_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> None:
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    delete_local_upload_if_exists(activity.image_url, BASE_UPLOAD_DIR)
    db.delete(activity)
    db.commit()
