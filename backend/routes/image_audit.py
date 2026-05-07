from fastapi import APIRouter, Depends

from auth import get_current_active_user

router = APIRouter(prefix="/image-audit", tags=["Image Audit"])


@router.get("/status")
def audit_status(_current_user = Depends(get_current_active_user)) -> dict:
    """Image audit status - deprecated, using Supabase Storage instead"""
    return {"status": "deprecated", "message": "Using Supabase Storage for file management"}
