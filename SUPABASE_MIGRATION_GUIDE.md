# SQLite to Supabase Migration Guide

## Step 1: Set Up Supabase Project

### Create Supabase Account & Project
1. Go to [supabase.com](https://supabase.com) and sign up
2. Click "New Project"
3. Fill in:
   - **Project Name**: `iei-kanyakumari` (or your choice)
   - **Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location (e.g., Asia-Singapore)
4. Click "Create new project" and wait 2-3 minutes for setup

### Get Your Credentials
After project creation:
1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon (public) key**: Start with `eyJh...`
   - **service_role key**: Start with `eyJh...` (keep secret!)

3. Create `.env` file in your `backend/` directory:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
DATABASE_URL=postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres
```

---

## Step 2: Create Database Schema in Supabase

### Option A: Using Supabase Dashboard (Recommended for first-time)
1. Go to your Supabase project dashboard
2. Click **SQL Editor** on the left sidebar
3. Click **+ New Query**
4. Copy the entire content from `supabase_migration.sql` (provided separately)
5. Click **Run** to execute

### Option B: Using psql CLI (Advanced)
```bash
psql postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres < supabase_migration.sql
```

---

## Step 3: Export Data from SQLite

### Export SQLite to CSV
```python
import sqlite3
import csv
import json
from pathlib import Path

db_path = Path("backend/app.db")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Define tables to export
TABLES = ["users", "members", "gallery", "newsletters", "activities", "facilities", "downloads", "contacts", "conferences"]

export_dir = Path("sqlite_exports")
export_dir.mkdir(exist_ok=True)

for table in TABLES:
    cursor.execute(f"SELECT * FROM {table}")
    rows = cursor.fetchall()
    
    if not rows:
        print(f"⏭️  {table}: No data to export")
        continue
    
    # Get column names
    cursor.execute(f"PRAGMA table_info({table})")
    columns = [col[1] for col in cursor.fetchall()]
    
    # Export to CSV
    csv_path = export_dir / f"{table}.csv"
    with open(csv_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(columns)
        writer.writerows(rows)
    
    print(f"✅ {table}: Exported {len(rows)} rows to {csv_path}")

conn.close()
```

**Run this script:**
```bash
cd backend
python export_sqlite.py
```

This creates a `sqlite_exports/` folder with CSV files for each table.

---

## Step 4: Migrate Data to Supabase

### Using pgAdmin (Easiest)
1. In Supabase dashboard, click **SQL Editor**
2. For each CSV, use the import UI or copy-paste INSERT statements

### Using Python + Supabase Client
Create `migrate_data.py`:
```python
import csv
from pathlib import Path
from supabase import create_client, Client
import json
from datetime import datetime

SUPABASE_URL = "YOUR_SUPABASE_URL"
SUPABASE_KEY = "YOUR_SERVICE_ROLE_KEY"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

TABLES = ["users", "members", "gallery", "newsletters", "activities", "facilities", "downloads", "contacts", "conferences"]
export_dir = Path("sqlite_exports")

for table in TABLES:
    csv_path = export_dir / f"{table}.csv"
    
    if not csv_path.exists():
        print(f"⏭️  {table}: CSV not found")
        continue
    
    rows = []
    with open(csv_path, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Convert timestamp strings to ISO format
            for key in list(row.keys()):
                if "at" in key.lower() and row[key]:
                    try:
                        # Handle SQLite datetime format
                        row[key] = datetime.fromisoformat(row[key]).isoformat()
                    except:
                        pass
            rows.append(row)
    
    if not rows:
        print(f"⏭️  {table}: No data")
        continue
    
    # Batch insert in chunks of 1000
    for i in range(0, len(rows), 1000):
        batch = rows[i : i + 1000]
        try:
            supabase.table(table).insert(batch).execute()
            print(f"✅ {table}: Inserted {len(batch)} rows")
        except Exception as e:
            print(f"❌ {table}: Error - {e}")

print("✅ Migration complete!")
```

**Run this:**
```bash
pip install supabase
python migrate_data.py
```

---

## Step 5: Update Backend Code

### Install Supabase Client
```bash
pip install supabase
```

### Update `backend/database.py`
Replace with Supabase client setup (see `supabase_database.py`)

### Update All Routes
Replace SQLAlchemy queries with Supabase client calls (see `supabase_examples.py`)

---

## Step 6: Enable Supabase Features

### Authentication
Supabase provides built-in auth. Update your login route to use:
```python
from supabase import create_client

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Sign up
auth_response = supabase.auth.sign_up({
    "email": "user@example.com",
    "password": "password123"
})

# Sign in
session = supabase.auth.sign_in_with_password({
    "email": "user@example.com",
    "password": "password123"
})
```

### Storage (for image uploads)
```python
# Upload file
supabase.storage.from_("members").upload(
    "path/to/image.jpg",
    file_data
)

# Get public URL
url = supabase.storage.from_("members").get_public_url("path/to/image.jpg")
```

---

## Step 7: Set Up Row-Level Security (RLS)

Enable RLS on sensitive tables:
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read members
CREATE POLICY "Allow public read" ON members
  FOR SELECT USING (true);

-- Allow only authenticated users to manage contacts
CREATE POLICY "Allow authenticated insert" ON contacts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

---

## Step 8: Verify Migration

### Test Endpoints
1. Test public endpoints (members, gallery, etc.)
2. Test admin endpoints (create, update, delete)
3. Test authentication
4. Test file uploads

### Performance Check
- Query times should be similar or faster
- Storage usage in Supabase dashboard

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid API key" | Check SUPABASE_KEY in .env |
| "Timestamp format error" | Convert to ISO format (YYYY-MM-DD HH:MM:SS) |
| "CORS error" | Add frontend URL to Supabase allowed origins |
| "RLS blocking access" | Check RLS policies on table |
| "File upload fails" | Check storage bucket permissions |

---

## Rollback Plan

If something goes wrong:
1. Keep your SQLite `app.db` as backup
2. You can restore Supabase data from project backups (automatic daily)
3. To revert: Update `DATABASE_URL` back to SQLite and restart backend

---

## Next Steps

1. ✅ Complete all migration steps
2. ✅ Test thoroughly in development
3. ✅ Update frontend `.env` if needed
4. ✅ Deploy to production
5. ✅ Monitor Supabase dashboard for performance

---

**Questions?** Check [Supabase Docs](https://supabase.com/docs) or join their Discord community.
