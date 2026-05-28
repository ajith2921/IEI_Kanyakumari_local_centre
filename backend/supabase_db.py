"""
Supabase Database Client
Replaces SQLAlchemy for PostgreSQL/Supabase
"""

import os
from typing import Any, List, Dict, Optional
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()

try:
    from supabase import create_client, Client
except ImportError:
    raise ImportError("supabase package required. Install: pip install supabase")

# Supabase credentials from environment
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    raise ValueError(
        "Missing Supabase credentials. Add to .env:\n"
        "  SUPABASE_URL=https://xxxxx.supabase.co\n"
        "  SUPABASE_KEY=your_anon_key\n"
        "  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
    )


# ── Singleton clients (created once per process) ──────────────────────────────
_anon_client: "Client | None" = None
_admin_client: "Client | None" = None


def get_supabase_client() -> Client:
    """Get Supabase anon client (singleton)"""
    global _anon_client
    if _anon_client is None:
        _anon_client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    return _anon_client


def get_supabase_admin_client() -> Client:
    """Get Supabase service-role client (singleton)"""
    global _admin_client
    if _admin_client is None:
        _admin_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    return _admin_client


class SupabaseDB:
    """Wrapper around Supabase client for common database operations"""
    
    def __init__(self, is_admin: bool = False):
        """
        Initialize Supabase DB client
        Args:
            is_admin: Use admin client (service role) for admin operations
        """
        self.is_admin = is_admin

    @property
    def client(self) -> Client:
        return get_supabase_admin_client() if self.is_admin else get_supabase_client()
    
    def select(self, table: str, columns: str = "*", filters: Optional[Dict[str, Any]] = None) -> List[Dict]:
        """
        SELECT query
        
        Example:
            db.select("members", filters={"position": "Chairman"})
        """
        query = self.client.table(table).select(columns)
        
        if filters:
            for key, value in filters.items():
                if isinstance(value, list):
                    query = query.in_(key, value)
                elif value is None:
                    query = query.is_(key, None)
                else:
                    query = query.eq(key, value)
        
        return query.execute().data or []
    
    def select_one(self, table: str, filters: Dict[str, Any]) -> Optional[Dict]:
        """SELECT single record"""
        results = self.select(table, filters=filters)
        return results[0] if results else None
    
    def select_all(self, table: str) -> List[Dict]:
        """SELECT all records"""
        return self.select(table)
    
    def count(self, table: str, filters: Optional[Dict[str, Any]] = None) -> int:
        """COUNT records"""
        query = self.client.table(table).select("id", count="exact")
        
        if filters:
            for key, value in filters.items():
                query = query.eq(key, value)
        
        result = query.execute()
        return result.count or 0
    
    def insert(self, table: str, data: Dict[str, Any]) -> Dict:
        """INSERT single record"""
        try:
            result = self.client.table(table).insert(data).execute()
            return result.data[0] if result.data else {}
        except Exception as exc:
            message = str(exc).lower()
            # Only attempt ID-based retry for sequence/duplicate-key errors on non-id fields
            is_dup_key = "duplicate key value violates unique constraint" in message
            if not is_dup_key or "id" in data:
                raise

            latest = self.client.table(table).select("id").order("id", desc=True).limit(1).execute().data or []
            next_id = 1
            if latest and latest[0].get("id") is not None:
                try:
                    next_id = int(latest[0]["id"]) + 1
                except (TypeError, ValueError):
                    raise

            retry_data = dict(data)
            retry_data["id"] = next_id
            result = self.client.table(table).insert(retry_data).execute()
            return result.data[0] if result.data else {}
    
    def insert_batch(self, table: str, rows: List[Dict[str, Any]]) -> List[Dict]:
        """INSERT multiple records"""
        if not rows:
            return []
        
        # Batch insert in chunks of 1000
        all_data = []
        for i in range(0, len(rows), 1000):
            batch = rows[i : i + 1000]
            result = self.client.table(table).insert(batch).execute()
            all_data.extend(result.data or [])
        
        return all_data
    
    def update(self, table: str, data: Dict[str, Any], filters: Dict[str, Any]) -> Dict:
        """UPDATE record"""
        query = self.client.table(table).update(data)
        
        for key, value in filters.items():
            query = query.eq(key, value)
        
        result = query.execute()
        return result.data[0] if result.data else {}
    
    def upsert(self, table: str, data: Dict[str, Any]) -> Dict:
        """INSERT or UPDATE (UPSERT)"""
        result = self.client.table(table).upsert(data).execute()
        return result.data[0] if result.data else {}
    
    def delete(self, table: str, filters: Dict[str, Any]) -> int:
        """DELETE records"""
        # First, check if the record(s) exist
        existing = self.select(table, filters=filters)
        if not existing:
            return 0
        
        # Delete the record(s)
        query = self.client.table(table).delete()
        
        for key, value in filters.items():
            query = query.eq(key, value)
        
        result = query.execute()
        # Return the number of records that existed (which we deleted)
        return len(existing)
    
    def order_by(self, table: str, column: str, ascending: bool = True, limit: Optional[int] = None) -> List[Dict]:
        """SELECT with ordering"""
        query = self.client.table(table).select("*")
        query = query.order(column, desc=not ascending)
        
        if limit:
            query = query.limit(limit)
        
        return query.execute().data or []
    
    def select_paginated(
        self,
        table: str,
        columns: str = "*",
        filters: Optional[Dict[str, Any]] = None,
        order_by: Optional[str] = None,
        ascending: bool = True,
        page: int = 1,
        limit: int = 20
    ) -> Dict[str, Any]:
        """
        Database-level pagination query.
        Returns a dict with items, total count, pages, and current page/limit.
        """
        # Ensure positive integers
        page = max(1, int(page))
        limit = max(1, min(int(limit), 100))
        
        # Start query for data with exact count
        query = self.client.table(table).select(columns, count="exact")
        
        if filters:
            for key, value in filters.items():
                if isinstance(value, list):
                    query = query.in_(key, value)
                elif value is None:
                    query = query.is_(key, None)
                else:
                    query = query.eq(key, value)
                    
        if order_by:
            query = query.order(order_by, desc=not ascending)
            
        # Calculate range (0-indexed for Postgrest)
        start = (page - 1) * limit
        end = start + limit - 1
        
        result = query.range(start, end).execute()
        
        total = result.count or 0
        pages = (total + limit - 1) // limit if limit > 0 else 0
        
        return {
            "items": result.data or [],
            "page": page,
            "limit": limit,
            "total": total,
            "pages": pages
        }



def delete_storage_file(bucket_name: str, file_url: str) -> None:
    """Delete a file from Supabase Storage given its public URL"""
    if not file_url:
        return
    
    marker = f"/object/public/{bucket_name}/"
    if marker in file_url:
        file_path = file_url.split(marker, 1)[1]
        if file_path:
            try:
                client = get_supabase_admin_client()
                client.storage.from_(bucket_name).remove([file_path])
            except Exception as e:
                print(f"Warning: Failed to delete storage file {file_path}: {e}")


# Convenience instance for non-admin operations
db = SupabaseDB(is_admin=False)
# Admin instance for admin operations
admin_db = SupabaseDB(is_admin=True)


# Export for use in routes
__all__ = ["db", "admin_db", "get_supabase_client", "get_supabase_admin_client", "SupabaseDB", "delete_storage_file"]
