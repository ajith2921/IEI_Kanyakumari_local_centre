from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from auth import get_current_active_user
from database import get_db
from models import Conference, User
from schemas import ConferenceCreate, ConferenceUpdate, ConferenceOut

router = APIRouter(prefix="/conferences", tags=["Conferences"])

@router.get("/active", response_model=ConferenceOut)
def get_active_conference(db: Session = Depends(get_db)):
    conference = db.query(Conference).filter(Conference.status == "active").first()
    if not conference:
        # If no active conference, return the most recent one
        conference = db.query(Conference).order_by(Conference.created_at.desc()).first()
    
    if not conference:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No conferences found"
        )
    return conference

@router.get("/", response_model=List[ConferenceOut])
def get_all_conferences(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return db.query(Conference).order_by(Conference.created_at.desc()).all()

@router.post("/", response_model=ConferenceOut)
def create_conference(
    payload: ConferenceCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # If this one is active, deactivate others
    if payload.status == "active":
        db.query(Conference).update({"status": "inactive"})
    
    new_conf = Conference(**payload.model_dump())
    db.add(new_conf)
    db.commit()
    db.refresh(new_conf)
    return new_conf

@router.put("/{id}", response_model=ConferenceOut)
def update_conference(
    id: int,
    payload: ConferenceUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    conf = db.query(Conference).filter(Conference.id == id).first()
    if not conf:
        raise HTTPException(status_code=404, detail="Conference not found")
    
    # If setting to active, deactivate others
    if payload.status == "active" and conf.status != "active":
        db.query(Conference).filter(Conference.id != id).update({"status": "inactive"})

    for key, value in payload.model_dump().items():
        setattr(conf, key, value)
    
    db.commit()
    db.refresh(conf)
    return conf

@router.delete("/{id}")
def delete_conference(
    id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    conf = db.query(Conference).filter(Conference.id == id).first()
    if not conf:
        raise HTTPException(status_code=404, detail="Conference not found")
    
    db.delete(conf)
    db.commit()
    return {"message": "Conference deleted"}
