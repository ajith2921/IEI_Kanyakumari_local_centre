from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status

from auth import get_current_active_user
from supabase_db import admin_db
from schemas import ContactCreate, ContactOut
from audit import log_action

router = APIRouter(prefix="/contact", tags=["Contact"])


def _is_missing_table_error(exc: Exception) -> bool:
    message = str(exc).lower()
    return "does not exist" in message and "contact" in message


def _insert_contact(table: str, payload: ContactCreate) -> None:
    admin_db.insert(table, payload.model_dump())


def _select_contacts(table: str) -> list[dict]:
    return admin_db.order_by(table, "created_at", ascending=False)


def _select_contact(table: str, message_id: int) -> Optional[dict]:
    return admin_db.select_one(table, {"id": message_id})


def _delete_contact(table: str, message_id: int) -> int:
    return admin_db.delete(table, {"id": message_id})


@router.post("", status_code=status.HTTP_201_CREATED)
def create_message(payload: ContactCreate) -> dict:
    """Create contact message"""
    try:
        _insert_contact("contact_messages", payload)
        return {"message": "Message sent successfully"}
    except Exception as e:
        if _is_missing_table_error(e):
            try:
                _insert_contact("contacts", payload)
                return {"message": "Message sent successfully"}
            except Exception as inner_exc:
                raise HTTPException(status_code=500, detail=f"Error creating message: {str(inner_exc)}")
        raise HTTPException(status_code=500, detail=f"Error creating message: {str(e)}")


@router.get("", response_model=list[ContactOut])
def list_messages(
    _current_user = Depends(get_current_active_user),
) -> list[dict]:
    """Get all contact messages"""
    try:
        messages = _select_contacts("contact_messages")
        return messages
    except Exception as e:
        if _is_missing_table_error(e):
            try:
                return _select_contacts("contacts")
            except Exception as inner_exc:
                raise HTTPException(status_code=500, detail=str(inner_exc))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{message_id}", response_model=ContactOut)
def get_message(
    message_id: int,
    _current_user = Depends(get_current_active_user),
) -> dict:
    """Get single contact message"""
    try:
        message = _select_contact("contact_messages", message_id)
        if not message:
            raise HTTPException(status_code=404, detail="Message not found")
        return message
    except HTTPException:
        raise
    except Exception as e:
        if _is_missing_table_error(e):
            message = _select_contact("contacts", message_id)
            if not message:
                raise HTTPException(status_code=404, detail="Message not found")
            return message
        raise HTTPException(status_code=500, detail=str(e))


@router.delete(
    "/{message_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
)
def delete_message(
    message_id: int,
    request: Request,
    current_user: dict = Depends(get_current_active_user),
) -> None:
    """Delete contact message"""
    try:
        # We need the message data for the audit log
        try:
            message = _select_contact("contact_messages", message_id)
        except Exception:
            message = _select_contact("contacts", message_id)

        count = _delete_contact("contact_messages", message_id)
        if count == 0:
            raise HTTPException(status_code=404, detail="Message not found")

        log_action(
            request=request,
            current_user=current_user,
            action="DELETE",
            module="contact_messages",
            record_id=message_id,
            old_data=message,
        )
        return None
    except HTTPException:
        raise
    except Exception as e:
        if _is_missing_table_error(e):
            count = _delete_contact("contacts", message_id)
            if count == 0:
                raise HTTPException(status_code=404, detail="Message not found")

            log_action(
                request=request,
                current_user=current_user,
                action="DELETE",
                module="contacts",
                record_id=message_id,
                old_data=message,
            )
            return None
        raise HTTPException(status_code=500, detail=f"Error deleting message: {str(e)}")
