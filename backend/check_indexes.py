import os
import sys

from dotenv import load_dotenv

# Load env variables
load_dotenv("d:/director/backend/.env")

from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

try:
    # Attempt to query pg_indexes
    # Note: PostgREST usually blocks access to system catalogs like pg_indexes
    result = client.table("pg_indexes").select("*").eq("schemaname", "public").execute()
    print("SUCCESS")
    for r in result.data:
        print(f"Table: {r['tablename']}, Index: {r['indexname']}")
except Exception as e:
    print(f"ERROR: {e}")
