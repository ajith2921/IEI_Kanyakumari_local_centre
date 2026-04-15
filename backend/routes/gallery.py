from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from auth import get_current_active_user
from database import get_db
from models import GalleryItem, User
from routes.file_utils import (
    delete_local_upload_if_exists,
    normalize_remote_image_url,
    save_optimized_image_file,
)
from schemas import GalleryOut

router = APIRouter(prefix="/gallery", tags=["Gallery"])
BASE_UPLOAD_DIR = Path(__file__).resolve().parents[1] / "uploads"
IMAGE_TYPES = {".jpg", ".jpeg", ".png", ".webp"}
GALLERY_IMAGE_SIZE = (800, 600)


def _require_value(value: str, field_label: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        raise HTTPException(status_code=400, detail=f"{field_label} is required.")
    return cleaned


@router.get("", response_model=list[GalleryOut])
def list_gallery(db: Session = Depends(get_db)) -> list[GalleryItem]:
    return db.query(GalleryItem).order_by(GalleryItem.created_at.desc()).all()


@router.post("", response_model=GalleryOut, status_code=status.HTTP_201_CREATED)
def create_gallery_item(
    title: str = Form(...),
    description: str = Form(default=""),
    image: Optional[UploadFile] = File(default=None),
    image_url: str = Form(default=""),
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> GalleryItem:
    normalized_title = _require_value(title, "Title")
    normalized_description = description.strip()

    selected_file = image if image and image.filename else None
    try:
        provided_url = normalize_remote_image_url(image_url)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if not selected_file and not provided_url:
        raise HTTPException(
            status_code=400,
            detail="Please upload an image file or provide an image URL.",
        )

    if selected_file:
        try:
            image_url_value = save_optimized_image_file(
                selected_file,
                BASE_UPLOAD_DIR,
                "gallery",
                IMAGE_TYPES,
                GALLERY_IMAGE_SIZE,
            )
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
    else:
        image_url_value = provided_url

    item = GalleryItem(
        title=normalized_title,
        description=normalized_description,
        image_url=image_url_value,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete(
    "/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
)
def delete_gallery_item(
    item_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> None:
    item = db.query(GalleryItem).filter(GalleryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Gallery item not found")

    delete_local_upload_if_exists(item.image_url, BASE_UPLOAD_DIR)

    db.delete(item)
    db.commit()
