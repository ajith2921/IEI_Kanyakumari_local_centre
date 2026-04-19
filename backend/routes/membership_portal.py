from __future__ import annotations

from datetime import date, datetime, timedelta
import hashlib
from io import BytesIO
import os
import secrets
from typing import Dict, Optional, Union

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import or_
from sqlalchemy.orm import Session

from auth import (
    create_access_token,
    get_current_membership_member,
    hash_password,
    verify_password,
)
from database import get_db
from models import Member, MemberCpdRecord, MembershipPasswordResetToken, MembershipRequest
from schemas import (
    MembershipPortalAuthOut,
    MembershipPortalCpdOut,
    MembershipPortalForgotPassword,
    MembershipPortalForgotPasswordOut,
    MembershipPortalLogin,
    MembershipPortalProfileOut,
    MembershipPortalRefreshRequest,
    MembershipPortalRegister,
    MembershipPortalResetPassword,
)

router = APIRouter(tags=["Membership Portal"])
OPEN_REVIEW_STATUSES = ("new", "reviewed")
LOCKOUT_MAX_ATTEMPTS = max(1, int(os.getenv("MEMBERSHIP_LOCKOUT_MAX_ATTEMPTS", "5")))
LOCKOUT_WINDOW_MINUTES = max(1, int(os.getenv("MEMBERSHIP_LOCKOUT_MINUTES", "15")))
RESET_TOKEN_EXPIRY_MINUTES = max(5, int(os.getenv("MEMBERSHIP_RESET_TOKEN_EXPIRY_MINUTES", "30")))
REFRESH_TOKEN_EXPIRY_DAYS = max(1, int(os.getenv("MEMBERSHIP_REFRESH_TOKEN_EXPIRY_DAYS", "14")))
MEMBERSHIP_ACCESS_TOKEN_EXPIRE_MINUTES = max(
    1,
    int(
        os.getenv(
            "MEMBERSHIP_ACCESS_TOKEN_EXPIRE_MINUTES",
            os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120"),
        )
    ),
)
EXPOSE_RESET_TOKEN = (os.getenv("MEMBERSHIP_EXPOSE_RESET_TOKEN", "true") or "").strip().lower() in {
    "1",
    "true",
    "yes",
    "on",
}

CPD_SEED_RECORDS = [
    {
        "title": "Advanced Structural Analysis Workshop",
        "category": "Technical Workshop",
        "credit_hours": 4,
        "attended_on": "2026-01-18",
    },
    {
        "title": "Professional Ethics and Compliance Session",
        "category": "Professional Practice",
        "credit_hours": 2,
        "attended_on": "2026-02-22",
    },
    {
        "title": "Power Systems Reliability Seminar",
        "category": "Seminar",
        "credit_hours": 3,
        "attended_on": "2026-03-11",
    },
]


def _find_member_for_login(db: Session, identifier: str) -> Optional[Member]:
    normalized = identifier.strip()
    lowered = normalized.lower()
    return (
        db.query(Member)
        .filter(
            or_(
                Member.membership_id == normalized,
                Member.email == normalized,
                Member.email == lowered,
                Member.mobile == normalized,
            ),
            Member.password_hash != "",
        )
        .first()
    )


def _normalize_name(value: str) -> str:
    return " ".join(value.strip().lower().split())


def _utcnow() -> datetime:
    return datetime.utcnow()


def _hash_opaque_token(token_value: str) -> str:
    return hashlib.sha256(token_value.encode("utf-8")).hexdigest()


def _issue_refresh_token(member: Member) -> str:
    refresh_token = secrets.token_urlsafe(48)
    member.refresh_token_hash = _hash_opaque_token(refresh_token)
    member.refresh_token_expires_at = _utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRY_DAYS)
    return refresh_token


def _build_auth_response(member: Member, access_token: str, refresh_token: str) -> MembershipPortalAuthOut:
    return MembershipPortalAuthOut(
        access_token=access_token,
        refresh_token=refresh_token,
        access_expires_in=MEMBERSHIP_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        token_type="bearer",
        member={
            "id": member.id,
            "name": member.name,
            "membership_type": member.membership_type,
            "membership_id": member.membership_id,
        },
    )


def _raise_if_member_locked(member: Member) -> None:
    now = _utcnow()
    if not member.locked_until or member.locked_until <= now:
        return

    remaining_seconds = int((member.locked_until - now).total_seconds())
    remaining_minutes = max(1, (remaining_seconds + 59) // 60)
    raise HTTPException(
        status_code=429,
        detail=f"Account is temporarily locked. Try again in {remaining_minutes} minute(s).",
    )


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_membership_account(
    payload: MembershipPortalRegister,
    db: Session = Depends(get_db),
) -> Dict[str, Union[str, int]]:
    if payload.password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="Password and confirm password do not match.")

    membership_no = payload.membership_no.strip()
    email = payload.email.strip().lower()
    mobile = payload.mobile.strip()
    name = payload.name.strip()
    membership_type = payload.membership_type.strip().upper()
    interest_area = payload.interest_area.strip()

    if payload.existing_member and not membership_no:
        raise HTTPException(status_code=400, detail="Membership number is required for existing members.")

    existing_email = db.query(Member).filter(Member.email == email, Member.password_hash != "").first()
    if existing_email and existing_email.password_hash:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    existing_mobile = db.query(Member).filter(Member.mobile == mobile, Member.password_hash != "").first()
    if existing_mobile and existing_mobile.password_hash:
        raise HTTPException(status_code=409, detail="An account with this mobile already exists.")

    pending_email_request = (
        db.query(MembershipRequest)
        .filter(
            MembershipRequest.email == email,
            MembershipRequest.status.in_(OPEN_REVIEW_STATUSES),
        )
        .first()
    )
    if pending_email_request:
        raise HTTPException(
            status_code=409,
            detail="A membership application with this email is already pending review.",
        )

    pending_mobile_request = (
        db.query(MembershipRequest)
        .filter(
            MembershipRequest.mobile == mobile,
            MembershipRequest.status.in_(OPEN_REVIEW_STATUSES),
        )
        .first()
    )
    if pending_mobile_request:
        raise HTTPException(
            status_code=409,
            detail="A membership application with this mobile number is already pending review.",
        )

    linked_member: Optional[Member] = None

    if membership_no:
        existing_membership_no = (
            db.query(Member)
            .filter(Member.membership_id == membership_no, Member.password_hash != "")
            .first()
        )
        if existing_membership_no:
            raise HTTPException(status_code=409, detail="An account with this membership number already exists.")

        pending_membership_request = (
            db.query(MembershipRequest)
            .filter(
                MembershipRequest.membership_no == membership_no,
                MembershipRequest.status.in_(OPEN_REVIEW_STATUSES),
            )
            .first()
        )
        if pending_membership_request:
            raise HTTPException(
                status_code=409,
                detail="A membership application with this membership number is already pending review.",
            )

    if payload.existing_member:
        linked_member = db.query(Member).filter(Member.membership_id == membership_no).first()
        if not linked_member:
            raise HTTPException(status_code=404, detail="Membership number not found in member records.")

        if linked_member.password_hash:
            raise HTTPException(status_code=409, detail="An account for this membership number is already active.")

        if _normalize_name(linked_member.name) != _normalize_name(name):
            raise HTTPException(
                status_code=400,
                detail="Name does not match the existing membership record for this membership number.",
            )

        member_email = (linked_member.email or "").strip().lower()
        if member_email and member_email != email:
            raise HTTPException(
                status_code=400,
                detail="Email does not match the existing membership record.",
            )

        member_mobile = (linked_member.mobile or "").strip()
        if member_mobile and member_mobile != mobile:
            raise HTTPException(
                status_code=400,
                detail="Mobile number does not match the existing membership record.",
            )
    elif membership_no:
        assigned_membership = db.query(Member).filter(Member.membership_id == membership_no).first()
        if assigned_membership:
            raise HTTPException(
                status_code=409,
                detail="Membership number is already assigned. Use existing member registration instead.",
            )

    request_item = MembershipRequest(
        name=name,
        email=email,
        phone=mobile,
        mobile=mobile,
        organization=interest_area,
        message=f"Portal registration request for {membership_type} membership.",
        existing_member=payload.existing_member,
        membership_no=membership_no,
        membership_type=membership_type,
        interest_area=interest_area,
        password_hash=hash_password(payload.password),
        review_notes="",
        linked_member_id=linked_member.id if linked_member else None,
        approved_by="",
        status="new",
    )
    db.add(request_item)
    db.commit()
    db.refresh(request_item)

    return {
        "message": "Membership application submitted. You can sign in after admin approval.",
        "request_id": request_item.id,
    }


@router.post("/login", response_model=MembershipPortalAuthOut)
def login_membership_account(
    payload: MembershipPortalLogin,
    db: Session = Depends(get_db),
) -> MembershipPortalAuthOut:
    now = _utcnow()
    member = _find_member_for_login(db, payload.identifier)
    if not member:
        raise HTTPException(status_code=401, detail="Invalid credentials.")

    _raise_if_member_locked(member)

    if not verify_password(payload.password, member.password_hash):
        next_attempts = int(member.failed_login_attempts or 0) + 1

        if next_attempts >= LOCKOUT_MAX_ATTEMPTS:
            member.failed_login_attempts = 0
            member.locked_until = now + timedelta(minutes=LOCKOUT_WINDOW_MINUTES)
        else:
            member.failed_login_attempts = next_attempts

        db.commit()
        raise HTTPException(status_code=401, detail="Invalid credentials.")

    member.failed_login_attempts = 0
    member.locked_until = None
    member.last_login_at = now

    access_token = create_access_token(
        {"sub": f"member:{member.id}", "typ": "access"},
        expires_delta=timedelta(minutes=MEMBERSHIP_ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    refresh_token = _issue_refresh_token(member)
    db.commit()
    db.refresh(member)

    return _build_auth_response(member, access_token, refresh_token)


@router.post("/forgot-password", response_model=MembershipPortalForgotPasswordOut)
def forgot_membership_password(
    payload: MembershipPortalForgotPassword,
    db: Session = Depends(get_db),
) -> MembershipPortalForgotPasswordOut:
    identifier = payload.identifier.strip()
    lowered_identifier = identifier.lower()
    response_payload = MembershipPortalForgotPasswordOut(
        message="If an account exists, password reset instructions have been sent.",
    )

    member = (
        db.query(Member)
        .filter(
            or_(Member.email == identifier, Member.email == lowered_identifier, Member.mobile == identifier),
            Member.password_hash != "",
        )
        .first()
    )
    if not member:
        return response_payload

    now = _utcnow()
    db.query(MembershipPasswordResetToken).filter(
        MembershipPasswordResetToken.member_id == member.id,
        MembershipPasswordResetToken.used_at.is_(None),
    ).update({MembershipPasswordResetToken.used_at: now}, synchronize_session=False)

    raw_token = secrets.token_urlsafe(40)
    token_record = MembershipPasswordResetToken(
        member_id=member.id,
        token_hash=_hash_opaque_token(raw_token),
        expires_at=now + timedelta(minutes=RESET_TOKEN_EXPIRY_MINUTES),
        used_at=None,
    )
    db.add(token_record)
    db.commit()

    if EXPOSE_RESET_TOKEN:
        response_payload.reset_token = raw_token
        response_payload.expires_in_minutes = RESET_TOKEN_EXPIRY_MINUTES

    return response_payload


@router.post("/membership-portal/token/refresh", response_model=MembershipPortalAuthOut)
def refresh_membership_session(
    payload: MembershipPortalRefreshRequest,
    db: Session = Depends(get_db),
) -> MembershipPortalAuthOut:
    now = _utcnow()
    refresh_hash = _hash_opaque_token(payload.refresh_token)

    member = (
        db.query(Member)
        .filter(Member.refresh_token_hash == refresh_hash, Member.password_hash != "")
        .first()
    )
    if (
        not member
        or not member.refresh_token_expires_at
        or member.refresh_token_expires_at <= now
    ):
        raise HTTPException(status_code=401, detail="Session refresh token is invalid or expired.")

    _raise_if_member_locked(member)

    access_token = create_access_token(
        {"sub": f"member:{member.id}", "typ": "access"},
        expires_delta=timedelta(minutes=MEMBERSHIP_ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    rotated_refresh_token = _issue_refresh_token(member)
    db.commit()
    db.refresh(member)

    return _build_auth_response(member, access_token, rotated_refresh_token)


@router.post("/membership-portal/reset-password")
def reset_membership_password(
    payload: MembershipPortalResetPassword,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    if payload.password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="Password and confirm password do not match.")

    now = _utcnow()
    token_hash = _hash_opaque_token(payload.token.strip())
    token_record = (
        db.query(MembershipPasswordResetToken)
        .filter(
            MembershipPasswordResetToken.token_hash == token_hash,
            MembershipPasswordResetToken.used_at.is_(None),
        )
        .order_by(MembershipPasswordResetToken.id.desc())
        .first()
    )

    if not token_record or token_record.expires_at <= now:
        raise HTTPException(status_code=400, detail="Reset token is invalid or expired.")

    member = db.query(Member).filter(Member.id == token_record.member_id).first()
    if not member or not member.password_hash:
        raise HTTPException(status_code=400, detail="Reset token is invalid or expired.")

    member.password_hash = hash_password(payload.password)
    member.failed_login_attempts = 0
    member.locked_until = None
    member.refresh_token_hash = ""
    member.refresh_token_expires_at = None

    db.query(MembershipPasswordResetToken).filter(
        MembershipPasswordResetToken.member_id == member.id,
        MembershipPasswordResetToken.used_at.is_(None),
    ).update({MembershipPasswordResetToken.used_at: now}, synchronize_session=False)

    db.commit()
    return {"message": "Password reset successful. Please sign in with your new password."}


@router.post("/membership-portal/logout")
def logout_membership_session(
    member: Member = Depends(get_current_membership_member),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    member.refresh_token_hash = ""
    member.refresh_token_expires_at = None
    db.commit()

    return {"message": "Signed out successfully."}


def _seed_member_cpd_records_if_missing(member_id: int, db: Session) -> None:
    existing = db.query(MemberCpdRecord).filter(MemberCpdRecord.member_id == member_id).count()
    if existing:
        return

    for record in CPD_SEED_RECORDS:
        db.add(
            MemberCpdRecord(
                member_id=member_id,
                title=record["title"],
                category=record["category"],
                credit_hours=record["credit_hours"],
                attended_on=record["attended_on"],
                status="completed",
            )
        )
    db.commit()


@router.get("/membership-portal/profile", response_model=MembershipPortalProfileOut)
def get_membership_profile(
    member: Member = Depends(get_current_membership_member),
) -> Member:
    return member


@router.get("/membership-portal/cpd-history", response_model=list[MembershipPortalCpdOut])
def get_membership_cpd_history(
    member: Member = Depends(get_current_membership_member),
    db: Session = Depends(get_db),
) -> list[MemberCpdRecord]:
    _seed_member_cpd_records_if_missing(member.id, db)

    return (
        db.query(MemberCpdRecord)
        .filter(MemberCpdRecord.member_id == member.id)
        .order_by(MemberCpdRecord.attended_on.desc(), MemberCpdRecord.id.desc())
        .all()
    )


@router.get("/membership-portal/certificate")
def download_membership_certificate(
    member: Member = Depends(get_current_membership_member),
) -> StreamingResponse:
    issued_on = date.today().isoformat()
    certificate_text = (
        "Institution of Engineers (India)\n"
        "Kanyakumari Local Centre\n"
        "\n"
        "Membership Certificate\n"
        "\n"
        f"This is to certify that {member.name} is registered as "
        f"{member.membership_type or 'Member'} under the institutional membership portal.\n"
        f"Membership Number: {member.membership_id or 'Pending Assignment'}\n"
        f"Interest Area: {member.interest_area or 'General Engineering'}\n"
        f"Issued On: {issued_on}\n"
    )

    content = certificate_text.encode("utf-8")
    filename = f"iei-membership-certificate-{member.id}.txt"
    headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
    return StreamingResponse(BytesIO(content), media_type="text/plain", headers=headers)
