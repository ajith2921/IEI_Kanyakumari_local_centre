from pathlib import Path
import re
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from auth import get_current_active_user
from database import get_db
from models import Member, User
from routes.file_utils import (
    delete_local_upload_if_exists,
    normalize_remote_image_url,
    save_optimized_image_file,
)
from schemas import MemberOut

router = APIRouter(prefix="/members", tags=["Members"])
BASE_UPLOAD_DIR = Path(__file__).resolve().parents[1] / "uploads"
IMAGE_TYPES = {".jpg", ".jpeg", ".png", ".webp"}
MEMBER_IMAGE_SIZE = (400, 400)
MEMBER_CROP_CENTER = (0.5, 0.3)
PHONE_PATTERN = re.compile(r"^[+]?[0-9\s()\-]{7,18}$")
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _require_value(value: str, field_label: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        raise HTTPException(status_code=400, detail=f"{field_label} is required.")
    return cleaned


def _require_email(value: str) -> str:
    cleaned = _require_value(value, "Email")
    if not EMAIL_PATTERN.fullmatch(cleaned):
        raise HTTPException(status_code=400, detail="Please provide a valid email address.")
    return cleaned


def _require_mobile(value: str) -> str:
    cleaned = _require_value(value, "Mobile")
    if not PHONE_PATTERN.fullmatch(cleaned):
        raise HTTPException(status_code=400, detail="Please provide a valid mobile number.")
    return cleaned


@router.get("", response_model=list[MemberOut])
def list_members(db: Session = Depends(get_db)) -> list[Member]:
    return (
        db.query(Member)
        .filter(or_(Member.password_hash == "", Member.password_hash.is_(None)))
        .order_by(Member.created_at.desc())
        .all()
    )


@router.get("/{member_id}", response_model=MemberOut)
def get_member(member_id: int, db: Session = Depends(get_db)) -> Member:
    member = (
        db.query(Member)
        .filter(
            Member.id == member_id,
            or_(Member.password_hash == "", Member.password_hash.is_(None)),
        )
        .first()
    )
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member


@router.post("", response_model=MemberOut, status_code=status.HTTP_201_CREATED)
def create_member(
    name: str = Form(...),
    position: str = Form(...),
    membership_id: str = Form(default=""),
    address: str = Form(...),
    email: str = Form(...),
    mobile: str = Form(...),
    image_url: str = Form(default=""),
    image: Optional[UploadFile] = File(default=None),
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> Member:
    normalized_name = _require_value(name, "Name")
    normalized_position = _require_value(position, "Position")
    normalized_membership_id = membership_id.strip()
    normalized_address = _require_value(address, "Address")
    normalized_email = _require_email(email)
    normalized_mobile = _require_mobile(mobile)

    if len(normalized_membership_id) > 80:
        raise HTTPException(status_code=400, detail="Membership ID is too long.")

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
                "members",
                IMAGE_TYPES,
                MEMBER_IMAGE_SIZE,
                crop_center=MEMBER_CROP_CENTER,
            )
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
    else:
        image_url_value = normalized_url

    member = Member(
        name=normalized_name,
        designation=normalized_position,
        organization=normalized_address,
        bio=normalized_membership_id,
        position=normalized_position,
        membership_id=normalized_membership_id,
        address=normalized_address,
        email=normalized_email,
        mobile=normalized_mobile,
        legacy_image_url=image_url_value,
        image=image_url_value,
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


@router.put("/{member_id}", response_model=MemberOut)
def update_member(
    member_id: int,
    name: str = Form(...),
    position: str = Form(...),
    membership_id: str = Form(default=""),
    address: str = Form(...),
    email: str = Form(...),
    mobile: str = Form(...),
    image_url: str = Form(default=""),
    image: Optional[UploadFile] = File(default=None),
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> Member:
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    normalized_name = _require_value(name, "Name")
    normalized_position = _require_value(position, "Position")
    normalized_membership_id = membership_id.strip()
    normalized_address = _require_value(address, "Address")
    normalized_email = _require_email(email)
    normalized_mobile = _require_mobile(mobile)

    if len(normalized_membership_id) > 80:
        raise HTTPException(status_code=400, detail="Membership ID is too long.")

    selected_file = image if image and image.filename else None

    try:
        normalized_url = normalize_remote_image_url(image_url)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    member.name = normalized_name
    member.designation = normalized_position
    member.organization = normalized_address
    member.bio = normalized_membership_id
    member.position = normalized_position
    member.membership_id = normalized_membership_id
    member.address = normalized_address
    member.email = normalized_email
    member.mobile = normalized_mobile

    if selected_file:
        try:
            next_image_url = save_optimized_image_file(
                selected_file,
                BASE_UPLOAD_DIR,
                "members",
                IMAGE_TYPES,
                MEMBER_IMAGE_SIZE,
                crop_center=MEMBER_CROP_CENTER,
            )
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

        delete_local_upload_if_exists(member.image_url, BASE_UPLOAD_DIR)
        member.image_url = next_image_url
    else:
        member.image_url = normalized_url

    db.commit()
    db.refresh(member)
    return member


@router.delete(
    "/{member_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
)
def delete_member(
    member_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> None:
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    delete_local_upload_if_exists(member.image_url, BASE_UPLOAD_DIR)
    db.delete(member)
    db.commit()
