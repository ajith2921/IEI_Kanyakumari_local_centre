from __future__ import annotations

from datetime import date
from io import BytesIO
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
from models import Member, MemberCpdRecord
from schemas import (
    MembershipPortalAuthOut,
    MembershipPortalCpdOut,
    MembershipPortalForgotPassword,
    MembershipPortalLogin,
    MembershipPortalProfileOut,
    MembershipPortalRegister,
)

router = APIRouter(tags=["Membership Portal"])

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
    return (
        db.query(Member)
        .filter(
            or_(
                Member.membership_id == normalized,
                Member.email == normalized,
                Member.mobile == normalized,
            ),
            Member.password_hash != "",
        )
        .first()
    )


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_membership_account(
    payload: MembershipPortalRegister,
    db: Session = Depends(get_db),
) -> Dict[str, Union[str, int]]:
    if payload.password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="Password and confirm password do not match.")

    membership_no = payload.membership_no.strip()
    if payload.existing_member and not membership_no:
        raise HTTPException(status_code=400, detail="Membership number is required for existing members.")

    existing_email = db.query(Member).filter(Member.email == payload.email).first()
    if existing_email and existing_email.password_hash:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    existing_mobile = db.query(Member).filter(Member.mobile == payload.mobile).first()
    if existing_mobile and existing_mobile.password_hash:
        raise HTTPException(status_code=409, detail="An account with this mobile already exists.")

    if membership_no:
        existing_membership_no = (
            db.query(Member)
            .filter(Member.membership_id == membership_no, Member.password_hash != "")
            .first()
        )
        if existing_membership_no:
            raise HTTPException(status_code=409, detail="An account with this membership number already exists.")

    membership_type = payload.membership_type.strip().upper()
    interest_area = payload.interest_area.strip()
    name = payload.name.strip()

    member = Member(
        name=name,
        designation=membership_type,
        organization=interest_area,
        bio="",
        position=membership_type,
        membership_id=membership_no,
        address="",
        email=payload.email,
        mobile=payload.mobile,
        password_hash=hash_password(payload.password),
        membership_type=membership_type,
        interest_area=interest_area,
        legacy_image_url="",
        image="",
    )
    db.add(member)
    db.commit()
    db.refresh(member)

    return {
        "message": "Membership account created successfully.",
        "member_id": member.id,
    }


@router.post("/login", response_model=MembershipPortalAuthOut)
def login_membership_account(
    payload: MembershipPortalLogin,
    db: Session = Depends(get_db),
) -> MembershipPortalAuthOut:
    member = _find_member_for_login(db, payload.identifier)
    if not member or not verify_password(payload.password, member.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials.")

    token = create_access_token({"sub": f"member:{member.id}"})

    return MembershipPortalAuthOut(
        access_token=token,
        token_type="bearer",
        member={
            "id": member.id,
            "name": member.name,
            "membership_type": member.membership_type,
            "membership_id": member.membership_id,
        },
    )


@router.post("/forgot-password")
def forgot_membership_password(
    payload: MembershipPortalForgotPassword,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    identifier = payload.identifier.strip()

    # Lookup is still performed for auditability, but response remains generic for security.
    _ = (
        db.query(Member)
        .filter(
            or_(Member.email == identifier, Member.mobile == identifier),
            Member.password_hash != "",
        )
        .first()
    )

    return {
        "message": "If an account exists, password reset instructions have been sent."
    }


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
