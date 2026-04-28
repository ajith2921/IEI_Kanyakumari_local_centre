from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from database import get_db
from models import Member

router = APIRouter(prefix="/membership-search", tags=["Membership Search"])

SAMPLE_CENTRES = [
    {"city": "Kolkata", "code": "CTR-04", "address": "8 Gokhale Road, Kolkata"},
    {"city": "Chennai", "code": "CTR-14", "address": "Anna Salai, Chennai"},
    {"city": "Lucknow", "code": "CTR-27", "address": "Hazratganj, Lucknow"},
]

SAMPLE_PRACTICING_ENGINEERS = [
    {
        "license": "PCE-3011",
        "name": "S. Mukherjee",
        "discipline": "Civil Engineering",
        "validity": "Valid till Mar 2027",
    },
    {
        "license": "PCE-4489",
        "name": "K. Menon",
        "discipline": "Electrical Engineering",
        "validity": "Valid till Aug 2026",
    },
]

SAMPLE_DISCREPANCY = {
    "ticket": "DISC-2026-0782",
    "category": "Name mismatch in certificate",
    "status": "Under Review",
    "updated_on": "25 Apr 2026",
}

SAMPLE_DESPATCH = {
    "reference": "DSP-2026-11483",
    "item": "Membership Certificate",
    "status": "In Transit",
    "updated_on": "24 Apr 2026",
}


def _build_member_centre(member: Member) -> str:
    return (member.organization or member.address or "").strip() or "Not Available"


def _build_member_grade(member: Member) -> str:
    return (member.membership_type or member.position or member.designation or "Member").strip() or "Member"


@router.get("/members")
def search_members(
    query: str = Query(default=""),
    db: Session = Depends(get_db),
) -> dict[str, list[dict[str, Any]]]:
    query_text = query.strip()

    db_query = db.query(Member)
    if query_text:
        like_query = f"%{query_text}%"
        db_query = db_query.filter(
            or_(
                Member.membership_id.ilike(like_query),
                Member.name.ilike(like_query),
                Member.organization.ilike(like_query),
                Member.address.ilike(like_query),
            )
        )

    members = db_query.order_by(Member.created_at.desc()).limit(30).all()

    items = [
        {
            "id": member.membership_id or f"MID-{member.id}",
            "name": member.name,
            "grade": _build_member_grade(member),
            "centre": _build_member_centre(member),
        }
        for member in members
    ]

    return {"items": items}


@router.get("/centres")
def search_centres(query: str = Query(default="")) -> dict[str, list[dict[str, str]]]:
    query_text = query.strip().lower()
    if not query_text:
        return {"items": SAMPLE_CENTRES}

    items = [
        centre
        for centre in SAMPLE_CENTRES
        if query_text in centre["city"].lower() or query_text in centre["code"].lower()
    ]
    return {"items": items}


@router.get("/practicing-engineers")
def search_practicing_engineers(query: str = Query(default="")) -> dict[str, list[dict[str, str]]]:
    query_text = query.strip().lower()
    if not query_text:
        return {"items": SAMPLE_PRACTICING_ENGINEERS}

    items = [
        engineer
        for engineer in SAMPLE_PRACTICING_ENGINEERS
        if query_text in engineer["license"].lower()
        or query_text in engineer["name"].lower()
        or query_text in engineer["discipline"].lower()
    ]
    return {"items": items}


@router.get("/discrepancies/{ticket}")
def get_discrepancy_status(ticket: str) -> dict[str, str]:
    normalized_ticket = ticket.strip().upper()
    if not normalized_ticket:
        raise HTTPException(status_code=400, detail="Discrepancy ticket is required.")

    if normalized_ticket != SAMPLE_DISCREPANCY["ticket"]:
        raise HTTPException(status_code=404, detail="Discrepancy ticket not found.")

    return SAMPLE_DISCREPANCY


@router.get("/despatch/{reference}")
def get_despatch_status(reference: str) -> dict[str, str]:
    normalized_reference = reference.strip().upper()
    if not normalized_reference:
        raise HTTPException(status_code=400, detail="Despatch reference is required.")

    if normalized_reference != SAMPLE_DESPATCH["reference"]:
        raise HTTPException(status_code=404, detail="Despatch reference not found.")

    return SAMPLE_DESPATCH
