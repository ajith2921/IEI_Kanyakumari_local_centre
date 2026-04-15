from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import get_current_active_user
from database import get_db
from models import MembershipRequest, User
from schemas import MembershipCreate, MembershipOut, MembershipStatusUpdate

router = APIRouter(prefix="/membership", tags=["Membership"])


@router.post("", status_code=status.HTTP_201_CREATED)
def create_membership_request(payload: MembershipCreate, db: Session = Depends(get_db)) -> dict:
    request_item = MembershipRequest(**payload.model_dump())
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
    payload: MembershipStatusUpdate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> MembershipRequest:
    request_item = db.query(MembershipRequest).filter(MembershipRequest.id == request_id).first()
    if not request_item:
        raise HTTPException(status_code=404, detail="Membership request not found")

    request_item.status = payload.status
    db.commit()
    db.refresh(request_item)
    return request_item


@router.delete(
    "/{request_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
)
def delete_membership_request(
    request_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> None:
    request_item = db.query(MembershipRequest).filter(MembershipRequest.id == request_id).first()
    if not request_item:
        raise HTTPException(status_code=404, detail="Membership request not found")

    db.delete(request_item)
    db.commit()
