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


@lru_cache(maxsize=1)
def get_supabase_client() -> Client:
    """Get Supabase client (cached)"""
    return create_client(SUPABASE_URL, SUPABASE_ANON_KEY)


@lru_cache(maxsize=1)
def get_supabase_admin_client() -> Client:
    """Get Supabase admin client (with service role key)"""
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


class SupabaseDB:
    """Wrapper around Supabase client for common database operations"""
    
    def __init__(self, is_admin: bool = False):
        """
        Initialize Supabase DB client
        Args:
            is_admin: Use admin client (service role) for admin operations
        """
        self.client = get_supabase_admin_client() if is_admin else get_supabase_client()
    
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
        result = self.client.table(table).insert(data).execute()
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
        query = self.client.table(table).delete()
        
        for key, value in filters.items():
            query = query.eq(key, value)
        
        return query.execute().count or 0
    
    def order_by(self, table: str, column: str, ascending: bool = True, limit: Optional[int] = None) -> List[Dict]:
        """SELECT with ordering"""
        query = self.client.table(table).select()
        query = query.order(column, desc=not ascending)
        
        if limit:
            query = query.limit(limit)
        
        return query.execute().data or []


# Convenience instance for non-admin operations
db = SupabaseDB(is_admin=False)
# Admin instance for admin operations
admin_db = SupabaseDB(is_admin=True)


# Export for use in routes
__all__ = ["db", "admin_db", "get_supabase_client", "get_supabase_admin_client", "SupabaseDB"]
