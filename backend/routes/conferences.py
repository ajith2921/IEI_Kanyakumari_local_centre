from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from auth import get_current_active_user
from supabase_db import admin_db
from schemas import ConferenceCreate, ConferenceUpdate, ConferenceOut

router = APIRouter(prefix="/conferences", tags=["Conferences"])


def _normalize_conference_status(conference: dict) -> dict:
    status_value = conference.get("status")
    if status_value is None or str(status_value).strip() == "":
        conference = dict(conference)
        conference["status"] = "inactive"
    return conference

@router.get("/active", response_model=ConferenceOut)
def get_active_conference():
    """Get active conference or most recent one"""
    try:
        # Try to get active conference
        conferences = admin_db.select("conferences", filters={"status": "active"})
        if conferences:
            return _normalize_conference_status(conferences[0])
        
        # If no active, get most recent
        conferences = admin_db.order_by("conferences", "created_at", ascending=False, limit=1)
        if conferences:
            return _normalize_conference_status(conferences[0])
        
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No conferences found"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[ConferenceOut])
def get_all_conferences():
    """Get all conferences"""
    try:
        conferences = admin_db.order_by("conferences", "created_at", ascending=False)
        return [_normalize_conference_status(conf) for conf in conferences]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=ConferenceOut)
def create_conference(
    payload: ConferenceCreate,
    _current_user = Depends(get_current_active_user),
):
    """Create new conference"""
    try:
        # If this one is active, deactivate others
        if payload.status == "active":
            all_confs = admin_db.select("conferences")
            for conf in all_confs:
                admin_db.update("conferences", {"status": "inactive"}, {"id": conf["id"]})
        
        new_conf = admin_db.insert("conferences", payload.model_dump())
        return new_conf
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating conference: {str(e)}")

@router.put("/{conf_id}", response_model=ConferenceOut)
def update_conference(
    conf_id: int,
    payload: ConferenceUpdate,
    _current_user = Depends(get_current_active_user),
):
    """Update conference"""
    try:
        conf = admin_db.select_one("conferences", {"id": conf_id})
        if not conf:
            raise HTTPException(status_code=404, detail="Conference not found")
        
        # If setting to active, deactivate others
        if payload.status == "active" and conf.get("status") != "active":
            all_confs = admin_db.select("conferences")
            for other_conf in all_confs:
                if other_conf["id"] != conf_id:
                    admin_db.update("conferences", {"status": "inactive"}, {"id": other_conf["id"]})
        
        updated_conf = admin_db.update("conferences", payload.model_dump(), {"id": conf_id})
        return updated_conf
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating conference: {str(e)}")

@router.delete("/{conf_id}")
def delete_conference(
    conf_id: int,
    _current_user = Depends(get_current_active_user),
):
    """Delete conference"""
    try:
        conf = admin_db.select_one("conferences", {"id": conf_id})
        if not conf:
            raise HTTPException(status_code=404, detail="Conference not found")
        
        admin_db.delete("conferences", {"id": conf_id})
        return {"message": "Conference deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting conference: {str(e)}")
