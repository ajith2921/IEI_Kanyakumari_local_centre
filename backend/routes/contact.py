from fastapi import APIRouter, Depends, HTTPException, status

from auth import get_current_active_user
from supabase_db import admin_db
from schemas import ContactCreate, ContactOut

router = APIRouter(prefix="/contact", tags=["Contact"])


@router.post("", status_code=status.HTTP_201_CREATED)
def create_message(payload: ContactCreate) -> dict:
    """Create contact message"""
    try:
        message_data = payload.model_dump()
        admin_db.insert("contact_messages", message_data)
        return {"message": "Message sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating message: {str(e)}")


@router.get("", response_model=list[ContactOut])
def list_messages(
    _current_user = Depends(get_current_active_user),
) -> list[dict]:
    """Get all contact messages"""
    try:
        messages = admin_db.order_by("contact_messages", "created_at", ascending=False)
        return messages
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{message_id}", response_model=ContactOut)
def get_message(
    message_id: int,
    _current_user = Depends(get_current_active_user),
) -> dict:
    """Get single contact message"""
    try:
        message = admin_db.select_one("contact_messages", {"id": message_id})
        if not message:
            raise HTTPException(status_code=404, detail="Message not found")
        return message
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete(
    "/{message_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
)
def delete_message(
    message_id: int,
    _current_user = Depends(get_current_active_user),
) -> None:
    """Delete contact message"""
    try:
        count = admin_db.delete("contact_messages", {"id": message_id})
        if count == 0:
            raise HTTPException(status_code=404, detail="Message not found")
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting message: {str(e)}")
