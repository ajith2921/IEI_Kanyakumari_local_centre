"""
Export data from SQLite database to CSV files
Run: python export_sqlite.py
"""

import sqlite3
import csv
from pathlib import Path
from datetime import datetime


def export_sqlite():
    db_path = Path("app.db")
    
    if not db_path.exists():
        print(f"❌ Database file not found: {db_path}")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Define tables to export
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
    export_dir.mkdir(exist_ok=True)
    
    print("🚀 Starting SQLite export...\n")
    
    total_records = 0
    
    for table in TABLES:
        try:
            cursor.execute(f"SELECT * FROM {table}")
            rows = cursor.fetchall()
            
            if not rows:
                print(f"⏭️  {table:20} No data to export")
                continue
            
            # Get column names
            cursor.execute(f"PRAGMA table_info({table})")
            columns = [col[1] for col in cursor.fetchall()]
            
            # Export to CSV
            csv_path = export_dir / f"{table}.csv"
            with open(csv_path, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                writer.writerow(columns)
                writer.writerows(rows)
            
            print(f"✅ {table:20} {len(rows):5} rows → {csv_path.name}")
            total_records += len(rows)
            
        except Exception as e:
            print(f"❌ {table:20} Error: {e}")
    
    conn.close()
    
    print(f"\n{'='*60}")
    print(f"✅ Export complete! Total records: {total_records}")
    print(f"📁 All files saved to: {export_dir.absolute()}")
    print(f"{'='*60}")
    print("\n📋 Next steps:")
    print("1. Go to https://supabase.com and create a project")
    print("2. Copy the CSV files to Supabase using SQL Editor")
    print("3. Run: python migrate_data.py")


if __name__ == "__main__":
    export_sqlite()
