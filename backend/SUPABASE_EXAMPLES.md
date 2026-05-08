"""
Example: Converting routes from SQLAlchemy to Supabase
This shows the pattern for updating all your API routes
"""

# ============================================================================
# BEFORE: SQLAlchemy with SQLite
# ============================================================================

# from sqlalchemy.orm import Session
# from fastapi import APIRouter, Depends
# from database import get_db
# from models import Member
# 
# router = APIRouter(prefix="/members", tags=["Members"])
# 
# @router.get("", response_model=list)
# def list_members(db: Session = Depends(get_db)):
#     """Old SQLAlchemy approach"""
#     return (
#         db.query(Member)
#         .filter(or_(Member.password_hash == "", Member.password_hash.is_(None)))
#         .order_by(Member.created_at.desc())
#         .all()
#     )


# ============================================================================
# AFTER: Using Supabase Client
# ============================================================================

from fastapi import APIRouter, HTTPException, status
from supabase_db import db, admin_db
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/members", tags=["Members"])


class MemberOut(BaseModel):
    id: int
    name: str
    position: str
    membership_id: str
    address: str
    email: str
    mobile: str
    image_url: str


@router.get("", response_model=List[MemberOut])
def list_members():
    """Get all members (public endpoint)"""
    try:
        # Supabase: Simple SELECT with ordering
        members = db.order_by(
            "members",
            column="created_at",
            ascending=False
        )
        return members
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{member_id}", response_model=MemberOut)
def get_member(member_id: int):
    """Get single member by ID"""
    try:
        member = db.select_one("members", {"id": member_id})
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        return member
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=MemberOut, status_code=status.HTTP_201_CREATED)
def create_member(
    name: str,
    position: str,
    address: str,
    email: str,
    mobile: str,
    membership_id: str = "",
    image_url: str = ""
):
    """Create new member (admin only)"""
    try:
        member_data = {
            "name": name,
            "position": position,
            "address": address,
            "email": email,
            "mobile": mobile,
            "membership_id": membership_id,
            "image_url": image_url,
            "password_hash": "",  # Default empty for non-login members
        }
        
        # Insert and return the created record
        created = db.insert("members", member_data)
        return created
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{member_id}", response_model=MemberOut)
def update_member(
    member_id: int,
    name: str = None,
    position: str = None,
    address: str = None,
    email: str = None,
    mobile: str = None,
    membership_id: str = None,
    image_url: str = None
):
    """Update member (admin only)"""
    try:
        # Build update dict with only non-null values
        update_data = {
            k: v for k, v in {
                "name": name,
                "position": position,
                "address": address,
                "email": email,
                "mobile": mobile,
                "membership_id": membership_id,
                "image_url": image_url,
            }.items() if v is not None
        }
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # Update and return the record
        updated = db.update("members", update_data, {"id": member_id})
        if not updated:
            raise HTTPException(status_code=404, detail="Member not found")
        
        return updated
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_member(member_id: int):
    """Delete member (admin only)"""
    try:
        count = db.delete("members", {"id": member_id})
        if count == 0:
            raise HTTPException(status_code=404, detail="Member not found")
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============================================================================
# OTHER TABLE EXAMPLES
# ============================================================================

# GALLERY ROUTES
@router.get("/gallery", response_model=List[dict])
def get_gallery():
    """Get all gallery images"""
    return db.order_by("gallery", "created_at", ascending=False)


@router.post("/gallery", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_gallery_item(title: str, description: str, image_url: str):
    """Create gallery item"""
    return db.insert("gallery", {
        "title": title,
        "description": description,
        "image_url": image_url
    })


# ACTIVITIES ROUTES
@router.get("/activities", response_model=List[dict])
def get_activities():
    """Get all activities"""
    return db.order_by("activities", "created_at", ascending=False)


@router.post("/activities", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_activity(title: str, description: str, event_date: str, image_url: str):
    """Create activity"""
    return db.insert("activities", {
        "title": title,
        "description": description,
        "event_date": event_date,
        "image_url": image_url
    })


# NEWSLETTERS ROUTES
@router.get("/newsletters", response_model=List[dict])
def get_newsletters():
    """Get all newsletters"""
    return db.order_by("newsletters", "published_at", ascending=False)


@router.post("/newsletters", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_newsletter(title: str, summary: str, pdf_url: str):
    """Create newsletter"""
    return db.insert("newsletters", {
        "title": title,
        "summary": summary,
        "pdf_url": pdf_url
    })


# ============================================================================
# KEY DIFFERENCES: SQLAlchemy → Supabase
# ============================================================================

"""
1. IMPORTS:
   - Remove: from sqlalchemy.orm import Session, Depends
   - Add:    from supabase_db import db, admin_db

2. QUERY SYNTAX:
   SQLAlchemy:  db.query(Member).filter(...).order_by(...).all()
   Supabase:    db.order_by("members", "created_at")

3. FILTERING:
   SQLAlchemy:  .filter(Member.email == "test@example.com")
   Supabase:    db.select("members", filters={"email": "test@example.com"})

4. SINGLE RECORD:
   SQLAlchemy:  db.query(Member).filter(Member.id == 1).first()
   Supabase:    db.select_one("members", {"id": 1})

5. INSERT:
   SQLAlchemy:  db.add(Member(...)); db.commit()
   Supabase:    db.insert("members", {...})

6. UPDATE:
   SQLAlchemy:  member.name = "new"; db.commit()
   Supabase:    db.update("members", {"name": "new"}, {"id": member_id})

7. DELETE:
   SQLAlchemy:  db.delete(member); db.commit()
   Supabase:    db.delete("members", {"id": member_id})

8. DEPENDENCIES:
   - Remove: db: Session = Depends(get_db)
   - Use:    Direct imports from supabase_db module

9. RESPONSE MODELS:
   - Keep Pydantic models the same (they work with dict returns)
   - Or remove @response_model if returning raw dicts

10. ERROR HANDLING:
    - Use try/except blocks (Supabase raises exceptions)
    - Return HTTPException for API errors
"""
