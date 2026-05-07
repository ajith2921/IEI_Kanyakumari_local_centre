"""
Migrate data from SQLite CSV exports to Supabase
Prerequisites: pip install supabase python-dotenv
Run: python migrate_data.py
"""

import csv
import os
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

try:
    from supabase import create_client, Client
except ImportError:
    print("❌ supabase package not installed. Run: pip install supabase")
    exit(1)

# Get credentials from .env
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("❌ Missing Supabase credentials in .env")
    print("   Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Tables to migrate (in order to respect foreign keys)
TABLES = [
    "users",
    "members",
    "gallery",
    "newsletters",
    "activities",
    "facilities",
    "downloads",
    "contacts",
    "conferences"
]

export_dir = Path("sqlite_exports")


def convert_value(value, column_name):
    """Convert CSV values to appropriate types"""
    if not value or value == "None":
        return None
    
    # Handle boolean columns
    if column_name in ["is_active", "is_new"]:
        return value.lower() in ("true", "1", "yes")
    
    # Handle integer columns
    if column_name in ["id", "failed_login_attempts"]:
        try:
            return int(value)
        except:
            return 0
    
    # Handle datetime columns (convert SQLite format to ISO)
    if "at" in column_name.lower():
        try:
            # Try parsing SQLite datetime format
            dt = datetime.fromisoformat(value.replace(" ", "T"))
            return dt.isoformat()
        except:
            return None
    
    return str(value)


def migrate_table(table_name):
    """Migrate a single table from CSV to Supabase"""
    csv_path = export_dir / f"{table_name}.csv"
    
    if not csv_path.exists():
        print(f"⏭️  {table_name:20} CSV not found")
        return 0
    
    rows = []
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Convert values
            converted_row = {}
            for key, value in row.items():
                converted_row[key] = convert_value(value, key)
            rows.append(converted_row)
    
    if not rows:
        print(f"⏭️  {table_name:20} No data")
        return 0
    
    # Insert in batches of 500
    batch_size = 500
    total_inserted = 0
    
    for i in range(0, len(rows), batch_size):
        batch = rows[i : i + batch_size]
        try:
            # For upsert (in case some records already exist)
            response = supabase.table(table_name).upsert(batch, ignore_duplicates=False).execute()
            total_inserted += len(batch)
            print(f"   ├─ Batch {i//batch_size + 1}: {len(batch)} rows inserted", end="\r")
        except Exception as e:
            print(f"   ├─ Batch {i//batch_size + 1}: ❌ Error - {str(e)[:50]}")
            continue
    
    print(f"✅ {table_name:20} {total_inserted:5} rows migrated              ")
    return total_inserted


def main():
    print("\n" + "="*70)
    print("🚀 SQLite to Supabase Data Migration")
    print("="*70 + "\n")
    
    # Verify export directory exists
    if not export_dir.exists():
        print(f"❌ Export directory not found: {export_dir}")
        print("   Run: python export_sqlite.py")
        return
    
    print(f"📁 Reading from: {export_dir.absolute()}\n")
    print(f"🔗 Connecting to Supabase...\n")
    
    # Test connection
    try:
        health = supabase.table("users").select("id").limit(1).execute()
        print("✅ Connected to Supabase\n")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return
    
    total_records = 0
    
    # Disable all foreign key constraints temporarily (for migration)
    # Note: Supabase handles this differently, so we just proceed with insertion
    
    for table in TABLES:
        inserted = migrate_table(table)
        total_records += inserted
    
    print("\n" + "="*70)
    print(f"✅ Migration Complete! Total records migrated: {total_records}")
    print("="*70)
    
    print("\n📋 Next steps:")
    print("1. Verify data in Supabase dashboard")
    print("2. Update backend/database.py to use Supabase")
    print("3. Update all routes to use Supabase client")
    print("4. Test all API endpoints")
    print("5. Update .env in frontend with new API URL")


if __name__ == "__main__":
    main()
