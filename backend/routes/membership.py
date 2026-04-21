from datetime import datetime
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from auth import get_current_active_user
from database import get_db
from models import Member, MembershipRequest, User
from schemas import MembershipCreate, MembershipOut, MembershipStatusUpdate

router = APIRouter(prefix="/membership", tags=["Membership"])
AUDIT_LOGGER = logging.getLogger("uvicorn.error")


def _client_ip(request: Request) -> str:
    forwarded_for = (request.headers.get("x-forwarded-for") or "").strip()
    if forwarded_for:
        return forwarded_for.split(",", 1)[0].strip() or "unknown"
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


def _audit(event: str, **fields: object) -> None:
    details = " ".join(f"{key}={value}" for key, value in sorted(fields.items()))
    AUDIT_LOGGER.info("membership_event=%s %s", event, details)


def _generate_membership_number(db: Session) -> str:
    existing_ids = {
        (membership_id or "").strip()
        for (membership_id,) in db.query(Member.membership_id).all()
        if (membership_id or "").strip()
    }

    index = 1
    while True:
        candidate = f"IEI-KKLC-{index:04d}"
        if candidate not in existing_ids:
            return candidate
        index += 1


def _activate_membership_request(request_item: MembershipRequest, db: Session) -> Member:
    if not request_item.password_hash:
        raise HTTPException(
            status_code=400,
            detail="Cannot approve this request because credentials are missing.",
        )

    email = (request_item.email or "").strip().lower()
    mobile = (request_item.mobile or request_item.phone or "").strip()
    membership_type = (request_item.membership_type or "AMIE").strip().upper()
    interest_area = (request_item.interest_area or request_item.organization or "").strip()
    requested_membership_no = (request_item.membership_no or "").strip()

    linked_member: Optional[Member] = None
    if request_item.linked_member_id:
        linked_member = db.query(Member).filter(Member.id == request_item.linked_member_id).first()
        if not linked_member:
            raise HTTPException(status_code=404, detail="Linked member record not found for this request.")

    if email:
        email_query = db.query(Member).filter(Member.email == email, Member.password_hash != "")
        if linked_member:
            email_query = email_query.filter(Member.id != linked_member.id)
        if email_query.first():
            raise HTTPException(status_code=409, detail="Another active account already uses this email.")

    if mobile:
        mobile_query = db.query(Member).filter(Member.mobile == mobile, Member.password_hash != "")
        if linked_member:
            mobile_query = mobile_query.filter(Member.id != linked_member.id)
        if mobile_query.first():
            raise HTTPException(status_code=409, detail="Another active account already uses this mobile number.")

    if requested_membership_no:
        membership_query = db.query(Member).filter(Member.membership_id == requested_membership_no)
        if linked_member:
            membership_query = membership_query.filter(Member.id != linked_member.id)
        conflicting_member = membership_query.first()
        if conflicting_member:
            raise HTTPException(status_code=409, detail="Membership number is already assigned.")

    if not linked_member:
        assigned_membership_no = requested_membership_no or _generate_membership_number(db)
        linked_member = Member(
            name=request_item.name,
            designation=membership_type,
            organization=interest_area,
            bio=assigned_membership_no,
            position=membership_type,
            membership_id=assigned_membership_no,
            address="",
            email=email,
            mobile=mobile,
            password_hash=request_item.password_hash,
            membership_type=membership_type,
            interest_area=interest_area,
            legacy_image_url="",
            image="",
        )
        db.add(linked_member)
        db.flush()
    else:
        if requested_membership_no and linked_member.membership_id and linked_member.membership_id != requested_membership_no:
            raise HTTPException(status_code=409, detail="Membership number mismatch for linked member record.")

        if requested_membership_no:
            linked_member.membership_id = requested_membership_no
        elif not (linked_member.membership_id or "").strip():
            linked_member.membership_id = _generate_membership_number(db)

        linked_member.name = (request_item.name or linked_member.name).strip()
        linked_member.designation = membership_type
        linked_member.position = membership_type
        linked_member.organization = interest_area
        linked_member.interest_area = interest_area
        linked_member.email = email
        linked_member.mobile = mobile
        linked_member.password_hash = request_item.password_hash

    request_item.linked_member_id = linked_member.id
    request_item.membership_no = linked_member.membership_id or request_item.membership_no
    request_item.mobile = mobile
    request_item.phone = mobile
    request_item.membership_type = membership_type
    request_item.interest_area = interest_area

    return linked_member


@router.post("", status_code=status.HTTP_201_CREATED)
def create_membership_request(payload: MembershipCreate, db: Session = Depends(get_db)) -> dict:
    request_item = MembershipRequest(**payload.model_dump())
    if not request_item.mobile:
        request_item.mobile = request_item.phone
    if not request_item.phone:
        request_item.phone = request_item.mobile
    if not request_item.interest_area:
        request_item.interest_area = request_item.organization
    db.add(request_item)
    db.commit()
    return {"message": "Membership request submitted"}


@router.get("", response_model=list[MembershipOut])
def list_membership_requests(
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> list[MembershipRequest]:
    return db.query(MembershipRequest).order_by(MembershipRequest.created_at.desc()).all()


@router.patch("/{request_id}/status", response_model=MembershipOut)
def update_membership_status(
    request_id: int,
    request: Request,
    payload: MembershipStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> MembershipRequest:
    request_item = db.query(MembershipRequest).filter(MembershipRequest.id == request_id).first()
    if not request_item:
        raise HTTPException(status_code=404, detail="Membership request not found")

    previous_status = request_item.status
    request_item.review_notes = payload.review_notes

    if payload.status == "approved":
        _activate_membership_request(request_item, db)
        request_item.status = "approved"
        request_item.approved_by = current_user.username
        request_item.approved_at = datetime.utcnow()
    else:
        request_item.status = payload.status
        request_item.approved_by = ""
        request_item.approved_at = None

    db.commit()
    db.refresh(request_item)

    _audit(
        "membership_request_status_updated",
        request_ip=_client_ip(request),
        admin_user=current_user.username,
        request_id=request_item.id,
        previous_status=previous_status,
        new_status=request_item.status,
        linked_member_id=request_item.linked_member_id,
        note_length=len(payload.review_notes or ""),
    )

    return request_item


@router.delete(
    "/{request_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
)
def delete_membership_request(
    request_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> None:
    request_item = db.query(MembershipRequest).filter(MembershipRequest.id == request_id).first()
    if not request_item:
        raise HTTPException(status_code=404, detail="Membership request not found")

    db.delete(request_item)
    db.commit()

    _audit(
        "membership_request_deleted",
        request_ip=_client_ip(request),
        admin_user=current_user.username,
        request_id=request_id,
    )
