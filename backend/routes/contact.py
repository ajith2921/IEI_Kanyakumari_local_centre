from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import get_current_active_user
from database import get_db
from models import ContactMessage, User
from schemas import ContactCreate, ContactOut

router = APIRouter(prefix="/contact", tags=["Contact"])


@router.post("", status_code=status.HTTP_201_CREATED)
def create_message(payload: ContactCreate, db: Session = Depends(get_db)) -> dict:
    message = ContactMessage(**payload.model_dump())
    db.add(message)
    db.commit()
    return {"message": "Message sent successfully"}


@router.get("", response_model=list[ContactOut])
def list_messages(
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> list[ContactMessage]:
    return db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()


@router.delete(
    "/{message_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
)
def delete_message(
    message_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> None:
    message = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    db.delete(message)
    db.commit()
