"""
Quick Reference: Supabase Query Patterns
Keep this handy when converting routes from SQLAlchemy to Supabase
"""

from supabase_db import db, admin_db
from typing import List, Dict, Any


# ============================================================================
# BASIC OPERATIONS
# ============================================================================

# SELECT ALL
all_members = db.select("members")

# SELECT with filtering
active_users = db.select("users", filters={"is_active": True})

# SELECT single record
member = db.select_one("members", {"id": 1})

# COUNT records
total = db.count("members")
active_count = db.count("users", filters={"is_active": True})

# ORDER BY
latest = db.order_by("members", "created_at", ascending=False, limit=10)

# INSERT
new_member = db.insert("members", {
    "name": "John Doe",
    "email": "john@example.com",
    "position": "Member",
    "address": "123 Main St",
    "mobile": "1234567890"
})

# INSERT BATCH
members_list = [
    {"name": "John", "email": "john@example.com", "position": "Member"},
    {"name": "Jane", "email": "jane@example.com", "position": "Member"},
]
db.insert_batch("members", members_list)

# UPDATE
db.update("members", 
    {"name": "Jane Smith"}, 
    {"id": 2}
)

# UPSERT (INSERT or UPDATE)
db.upsert("members", {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane.smith@example.com"
})

# DELETE
db.delete("members", {"id": 3})


# ============================================================================
# COMMON PATTERNS
# ============================================================================

# GET ALL RECORDS WITH ORDERING
def get_all_members():
    return db.order_by("members", "created_at", ascending=False)

# GET SINGLE RECORD BY ID
def get_member_by_id(member_id: int):
    member = db.select_one("members", {"id": member_id})
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member

# SEARCH RECORDS (multiple filters)
def find_members_by_division(division: str):
    return db.select("members", filters={"position": division})

# CHECK IF RECORD EXISTS
def member_exists(member_id: int) -> bool:
    return db.count("members", {"id": member_id}) > 0

# GET COUNT
def get_total_members() -> int:
    return db.count("members")

# CREATE WITH RETURN
def create_gallery_item(title: str, description: str, image_url: str):
    return db.insert("gallery", {
        "title": title,
        "description": description,
        "image_url": image_url
    })

# UPDATE WITH VALIDATION
def update_member(member_id: int, update_data: Dict[str, Any]):
    # Verify exists
    if not member_exists(member_id):
        raise HTTPException(status_code=404, detail="Member not found")
    
    # Update
    return db.update("members", update_data, {"id": member_id})

# DELETE WITH RETURN
def delete_member(member_id: int):
    count = db.delete("members", {"id": member_id})
    if count == 0:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"deleted": True}

# BATCH OPERATIONS
def create_multiple_members(members_data: List[Dict]):
    return db.insert_batch("members", members_data)


# ============================================================================
# FILTERING PATTERNS
# ============================================================================

# EXACT MATCH
members_with_email = db.select("members", filters={"email": "john@example.com"})

# MULTIPLE CONDITIONS (AND)
# Note: Supabase client doesn't support OR natively in this wrapper
# For OR, you might need raw SQL or multiple queries
active_johns = db.select("members", filters={
    "email": "john@example.com",
    "is_active": True
})

# IN LIST
divisions = ["Civil Engineering Division", "Mechanical Engineering Division"]
# Option 1: Multiple queries
all_matches = []
for division in divisions:
    all_matches.extend(db.select("members", filters={"position": division}))

# Option 2: Extend Supabase client for custom queries
# Use custom SQL for complex queries


# ============================================================================
# PAGINATION
# ============================================================================

def paginate_members(page: int = 1, page_size: int = 10):
    """Paginate members"""
    offset = (page - 1) * page_size
    
    # Note: Basic Supabase client doesn't support pagination natively
    # You can extend it or use raw PostgreSQL
    # For now, fetch all and slice (not ideal for large datasets)
    all_members = db.select("members")
    return all_members[offset:offset + page_size]


# ============================================================================
# CUSTOM QUERIES (for complex operations)
# ============================================================================

from supabase_db import get_supabase_client

def complex_query_example():
    """For queries that need RPC or raw SQL"""
    supabase = get_supabase_client()
    
    # If you need more complex queries, you can use:
    # 1. Multiple simple queries
    # 2. Create PostgreSQL functions and call via RPC
    # 3. Extend the SupabaseDB class
    pass


# ============================================================================
# ADMIN OPERATIONS
# ============================================================================

from supabase_db import admin_db

# Use admin_db for operations that need admin privileges
# (already using service_role key internally)

def admin_list_all_users():
    """Admin can see all user data"""
    return admin_db.select("users")

def admin_update_user(user_id: int, is_active: bool):
    """Admin can modify any user"""
    return admin_db.update("users", 
        {"is_active": is_active},
        {"id": user_id}
    )


# ============================================================================
# ERROR HANDLING
# ============================================================================

from fastapi import HTTPException, status

def safe_get_member(member_id: int):
    """Get member with proper error handling"""
    try:
        member = db.select_one("members", {"id": member_id})
        if not member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Member {member_id} not found"
            )
        return member
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        # Log the error
        print(f"Database error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error"
        )


# ============================================================================
# TRANSACTION PATTERNS
# ============================================================================

def create_member_with_gallery():
    """Create member and add to gallery (pseudo-transaction)"""
    try:
        # Create member
        member = db.insert("members", {
            "name": "John Doe",
            "email": "john@example.com",
            "position": "Member",
            "address": "123 Main St",
            "mobile": "1234567890"
        })
        
        # Create gallery item for member
        gallery = db.insert("gallery", {
            "title": f"Gallery for {member['name']}",
            "image_url": "path/to/image.jpg"
        })
        
        return {
            "member": member,
            "gallery": gallery
        }
    except Exception as e:
        # In real scenario, you'd rollback
        # Supabase doesn't have native transactions in this wrapper
        print(f"Error: {e}")
        raise


# ============================================================================
# TIMESTAMP HANDLING
# ============================================================================

from datetime import datetime

def get_recent_activities(days: int = 7):
    """Get activities from last N days"""
    # Supabase stores dates as ISO strings
    # Filter by date string comparison
    
    # Simple approach: fetch all and filter in Python
    all_activities = db.select("activities")
    recent = [
        a for a in all_activities 
        if a.get("created_at")  # Could add date comparison here
    ]
    return recent


# ============================================================================
# COMMON CONVERSIONS FROM SQLAlchemy
# ============================================================================

"""
SQLAlchemy Pattern             → Supabase Pattern
─────────────────────────────────────────────────────────────

db.query(Member).all()         → db.select("members")
db.query(Member).first()       → db.select("members", limit=1)
db.query(Member)
  .filter_by(id=1).first()     → db.select_one("members", {"id": 1})

db.query(Member)
  .filter(Member.id == 1)
  .all()                       → db.select("members", filters={"id": 1})

db.query(Member)
  .order_by(Member.created_at
  .desc()).all()               → db.order_by("members", "created_at", 
                                            ascending=False)

db.query(Member).count()       → db.count("members")

db.add(Member(...))
db.commit()                    → db.insert("members", {...})

member.name = "new"
db.commit()                    → db.update("members", 
                                          {"name": "new"}, 
                                          {"id": member.id})

db.delete(member)
db.commit()                    → db.delete("members", {"id": member.id})

db.query(Member)
  .filter(Member.email == e)
  .count() > 0                 → db.count("members", 
                                         {"email": e}) > 0
"""
