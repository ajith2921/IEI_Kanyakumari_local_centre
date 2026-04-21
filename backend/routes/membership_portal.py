from __future__ import annotations

from datetime import date, datetime, timedelta
import hashlib
from io import BytesIO
import logging
import os
import secrets
from threading import Lock
import time
from typing import Dict, Optional, Union

from fastapi import APIRouter, Depends, HTTPException, Request, status
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

AUDIT_LOGGER = logging.getLogger("uvicorn.error")


def _env_flag(name: str, default: bool = False) -> bool:
    value = (os.getenv(name) or "").strip().lower()
    if not value:
        return default
    return value in {"1", "true", "yes", "on"}


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
EXPOSE_RESET_TOKEN = _env_flag("MEMBERSHIP_EXPOSE_RESET_TOKEN", False)

LOGIN_THROTTLE_LIMIT = max(1, int(os.getenv("MEMBERSHIP_LOGIN_THROTTLE_LIMIT", "20")))
LOGIN_THROTTLE_WINDOW_SECONDS = max(
    10,
    int(os.getenv("MEMBERSHIP_LOGIN_THROTTLE_WINDOW_SECONDS", "300")),
)
FORGOT_THROTTLE_LIMIT = max(1, int(os.getenv("MEMBERSHIP_FORGOT_THROTTLE_LIMIT", "5")))
FORGOT_THROTTLE_WINDOW_SECONDS = max(
    10,
    int(os.getenv("MEMBERSHIP_FORGOT_THROTTLE_WINDOW_SECONDS", "900")),
)
RESET_THROTTLE_LIMIT = max(1, int(os.getenv("MEMBERSHIP_RESET_THROTTLE_LIMIT", "10")))
RESET_THROTTLE_WINDOW_SECONDS = max(
    10,
    int(os.getenv("MEMBERSHIP_RESET_THROTTLE_WINDOW_SECONDS", "900")),
)
REFRESH_THROTTLE_LIMIT = max(1, int(os.getenv("MEMBERSHIP_REFRESH_THROTTLE_LIMIT", "30")))
REFRESH_THROTTLE_WINDOW_SECONDS = max(
    10,
    int(os.getenv("MEMBERSHIP_REFRESH_THROTTLE_WINDOW_SECONDS", "300")),
)

THROTTLE_STATE: Dict[str, list[float]] = {}
THROTTLE_LOCK = Lock()
THROTTLE_LAST_CLEANUP = 0.0
THROTTLE_CLEANUP_INTERVAL_SECONDS = max(
    30,
    int(os.getenv("MEMBERSHIP_THROTTLE_CLEANUP_SECONDS", "300")),
)

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


def _fingerprint(value: str) -> str:
    normalized = (value or "").strip().lower()
    if not normalized:
        return "na"
    return _hash_opaque_token(normalized)[:12]


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


def _cleanup_throttle_state(now: float) -> None:
    global THROTTLE_LAST_CLEANUP

    if now - THROTTLE_LAST_CLEANUP < THROTTLE_CLEANUP_INTERVAL_SECONDS:
        return

    THROTTLE_LAST_CLEANUP = now
    stale_cutoff = now - max(
        LOGIN_THROTTLE_WINDOW_SECONDS,
        FORGOT_THROTTLE_WINDOW_SECONDS,
        RESET_THROTTLE_WINDOW_SECONDS,
        REFRESH_THROTTLE_WINDOW_SECONDS,
    )

    for key, stamps in list(THROTTLE_STATE.items()):
        recent = [stamp for stamp in stamps if stamp >= stale_cutoff]
        if recent:
            THROTTLE_STATE[key] = recent
        else:
            THROTTLE_STATE.pop(key, None)


def _apply_rate_limit(action: str, key: str, limit: int, window_seconds: int) -> None:
    now = time.monotonic()
    bucket_key = f"{action}:{key}"

    with THROTTLE_LOCK:
        _cleanup_throttle_state(now)

        window_start = now - window_seconds
        hits = [stamp for stamp in THROTTLE_STATE.get(bucket_key, []) if stamp >= window_start]

        if len(hits) >= limit:
            retry_after = max(1, int(window_seconds - (now - hits[0])))
            raise HTTPException(
                status_code=429,
                detail=(
                    f"Too many {action.replace('_', ' ')} requests. "
                    f"Try again in {retry_after} second(s)."
                ),
            )

        hits.append(now)
        THROTTLE_STATE[bucket_key] = hits


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
    request: Request,
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

    _audit(
        "registration_submitted",
        request_ip=_client_ip(request),
        request_id=request_item.id,
        existing_member=payload.existing_member,
        email_fingerprint=_fingerprint(email),
        mobile_fingerprint=_fingerprint(mobile),
    )

    return {
        "message": "Membership application submitted. You can sign in after admin approval.",
        "request_id": request_item.id,
    }


@router.post("/login", response_model=MembershipPortalAuthOut)
def login_membership_account(
    request: Request,
    payload: MembershipPortalLogin,
    db: Session = Depends(get_db),
) -> MembershipPortalAuthOut:
    now = _utcnow()
    client_ip = _client_ip(request)
    identifier = payload.identifier.strip()
    identifier_fingerprint = _fingerprint(identifier)

    _apply_rate_limit(
        "login",
        client_ip,
        LOGIN_THROTTLE_LIMIT,
        LOGIN_THROTTLE_WINDOW_SECONDS,
    )

    member = _find_member_for_login(db, identifier)
    if not member:
        _audit(
            "login_failed_unknown_member",
            request_ip=client_ip,
            identifier_fingerprint=identifier_fingerprint,
        )
        raise HTTPException(status_code=401, detail="Invalid credentials.")

    if member.locked_until and member.locked_until > now:
        _audit(
            "login_blocked_locked",
            request_ip=client_ip,
            member_id=member.id,
            identifier_fingerprint=identifier_fingerprint,
        )
    _raise_if_member_locked(member)

    if not verify_password(payload.password, member.password_hash):
        next_attempts = int(member.failed_login_attempts or 0) + 1
        lock_applied = next_attempts >= LOCKOUT_MAX_ATTEMPTS

        if lock_applied:
            member.failed_login_attempts = 0
            member.locked_until = now + timedelta(minutes=LOCKOUT_WINDOW_MINUTES)
        else:
            member.failed_login_attempts = next_attempts

        db.commit()
        _audit(
            "login_locked_out" if lock_applied else "login_failed_password",
            request_ip=client_ip,
            member_id=member.id,
            identifier_fingerprint=identifier_fingerprint,
            failed_attempts=next_attempts,
        )
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

    _audit(
        "login_success",
        request_ip=client_ip,
        member_id=member.id,
        identifier_fingerprint=identifier_fingerprint,
    )

    return _build_auth_response(member, access_token, refresh_token)


@router.post("/forgot-password", response_model=MembershipPortalForgotPasswordOut)
def forgot_membership_password(
    request: Request,
    payload: MembershipPortalForgotPassword,
    db: Session = Depends(get_db),
) -> MembershipPortalForgotPasswordOut:
    identifier = payload.identifier.strip()
    lowered_identifier = identifier.lower()
    client_ip = _client_ip(request)
    identifier_fingerprint = _fingerprint(lowered_identifier)

    _apply_rate_limit(
        "forgot_password",
        f"{client_ip}:{identifier_fingerprint}",
        FORGOT_THROTTLE_LIMIT,
        FORGOT_THROTTLE_WINDOW_SECONDS,
    )

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
        _audit(
            "forgot_password_requested_unknown_member",
            request_ip=client_ip,
            identifier_fingerprint=identifier_fingerprint,
        )
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

    _audit(
        "forgot_password_token_issued",
        request_ip=client_ip,
        member_id=member.id,
        identifier_fingerprint=identifier_fingerprint,
    )

    if EXPOSE_RESET_TOKEN:
        response_payload.reset_token = raw_token
        response_payload.expires_in_minutes = RESET_TOKEN_EXPIRY_MINUTES

    return response_payload


@router.post("/membership-portal/token/refresh", response_model=MembershipPortalAuthOut)
def refresh_membership_session(
    request: Request,
    payload: MembershipPortalRefreshRequest,
    db: Session = Depends(get_db),
) -> MembershipPortalAuthOut:
    now = _utcnow()
    client_ip = _client_ip(request)

    _apply_rate_limit(
        "refresh_token",
        client_ip,
        REFRESH_THROTTLE_LIMIT,
        REFRESH_THROTTLE_WINDOW_SECONDS,
    )

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
        _audit(
            "refresh_failed_invalid_token",
            request_ip=client_ip,
            refresh_fingerprint=refresh_hash[:12],
        )
        raise HTTPException(status_code=401, detail="Session refresh token is invalid or expired.")

    if member.locked_until and member.locked_until > now:
        _audit(
            "refresh_blocked_locked",
            request_ip=client_ip,
            member_id=member.id,
        )
    _raise_if_member_locked(member)

    access_token = create_access_token(
        {"sub": f"member:{member.id}", "typ": "access"},
        expires_delta=timedelta(minutes=MEMBERSHIP_ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    rotated_refresh_token = _issue_refresh_token(member)
    db.commit()
    db.refresh(member)

    _audit(
        "refresh_success",
        request_ip=client_ip,
        member_id=member.id,
    )

    return _build_auth_response(member, access_token, rotated_refresh_token)


@router.post("/membership-portal/reset-password")
def reset_membership_password(
    request: Request,
    payload: MembershipPortalResetPassword,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    client_ip = _client_ip(request)

    _apply_rate_limit(
        "reset_password",
        client_ip,
        RESET_THROTTLE_LIMIT,
        RESET_THROTTLE_WINDOW_SECONDS,
    )

    if payload.password != payload.confirm_password:
        _audit(
            "reset_password_failed_mismatch",
            request_ip=client_ip,
        )
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
        _audit(
            "reset_password_failed_invalid_token",
            request_ip=client_ip,
            token_fingerprint=token_hash[:12],
        )
        raise HTTPException(status_code=400, detail="Reset token is invalid or expired.")

    member = db.query(Member).filter(Member.id == token_record.member_id).first()
    if not member or not member.password_hash:
        _audit(
            "reset_password_failed_member_not_found",
            request_ip=client_ip,
            token_fingerprint=token_hash[:12],
        )
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
    _audit(
        "reset_password_success",
        request_ip=client_ip,
        member_id=member.id,
    )
    return {"message": "Password reset successful. Please sign in with your new password."}


@router.post("/membership-portal/logout")
def logout_membership_session(
    request: Request,
    member: Member = Depends(get_current_membership_member),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    member.refresh_token_hash = ""
    member.refresh_token_expires_at = None
    db.commit()

    _audit(
        "logout_success",
        request_ip=_client_ip(request),
        member_id=member.id,
    )

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
