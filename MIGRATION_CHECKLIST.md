# Supabase Migration Checklist

## Phase 1: Setup & Preparation

- [ ] **1.1 Create Supabase Project**
  - Go to https://supabase.com
  - Click "New Project"
  - Enter project name: `iei-kanyakumari`
  - Create strong password and save it
  - Choose region (Asia Singapore recommended)
  - Wait 2-3 minutes for project creation

- [ ] **1.2 Get Supabase Credentials**
  - In Supabase dashboard → Settings → API
  - Copy **Project URL** (looks like `https://xxxxx.supabase.co`)
  - Copy **anon public key** (for frontend)
  - Copy **service_role key** (for backend - keep secret!)
  
- [ ] **1.3 Update Backend .env**
  ```env
  SUPABASE_URL=https://xxxxx.supabase.co
  SUPABASE_KEY=your_anon_key
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  ```

- [ ] **1.4 Create Storage Buckets**
  - In Supabase dashboard → Storage
  - Create buckets (public):
    - `members`
    - `gallery`
    - `activities`
    - `newsletters`
    - `downloads`

---

## Phase 2: Database Schema

- [ ] **2.1 Create SQL Schema**
  - Go to Supabase → SQL Editor
  - Click "New Query"
  - Copy entire content from `backend/supabase_migration.sql`
  - Click "Run" to execute
  - Verify all tables created (check Tables in left sidebar)

- [ ] **2.2 Verify Tables**
  - Check each table exists:
    - [ ] users
    - [ ] members
    - [ ] gallery
    - [ ] newsletters
    - [ ] activities
    - [ ] facilities
    - [ ] downloads
    - [ ] contacts
    - [ ] conferences

- [ ] **2.3 Verify RLS Policies**
  - Go to Authentication → Policies
  - Confirm policies created for each table

---

## Phase 3: Data Migration

- [ ] **3.1 Export from SQLite**
  ```bash
  cd backend
  python export_sqlite.py
  ```
  - Creates `sqlite_exports/` folder with CSV files
  - Verify all 9 CSV files exist (check file sizes > 0)

- [ ] **3.2 Install Supabase Client**
  ```bash
  pip install supabase
  ```

- [ ] **3.3 Migrate Data to Supabase**
  ```bash
  python migrate_data.py
  ```
  - Should show ✅ for each table
  - Verify total records match (compare with SQLite)

- [ ] **3.4 Verify Data in Supabase**
  - Go to Supabase → Table Editor
  - Click each table and verify records exist:
    - [ ] users (1 admin)
    - [ ] members (should have all members)
    - [ ] galleries
    - [ ] newsletters
    - [ ] activities
    - [ ] facilities
    - [ ] downloads
    - [ ] contacts
    - [ ] conferences

---

## Phase 4: Backend Code Updates

- [ ] **4.1 Update Requirements**
  ```bash
  pip install supabase python-dotenv
  ```

- [ ] **4.2 Replace database.py**
  - Backup current `backend/database.py`
  - Replace with new Supabase client setup
  - Or import from `supabase_db.py` (recommended)

- [ ] **4.3 Update Auth Routes** (`backend/routes/auth.py`)
  - [ ] Replace SQLAlchemy session with Supabase client
  - [ ] Update login query
  - [ ] Update user creation
  - Use pattern from `SUPABASE_EXAMPLES.md`

- [ ] **4.4 Update Members Routes** (`backend/routes/members.py`)
  - [ ] Replace all queries with Supabase client calls
  - [ ] `list_members()` → `db.select_all("members")`
  - [ ] `get_member()` → `db.select_one("members", filters)`
  - [ ] `create_member()` → `db.insert("members", data)`
  - [ ] `update_member()` → `db.update("members", data, filters)`
  - [ ] `delete_member()` → `db.delete("members", filters)`

- [ ] **4.5 Update Gallery Routes** (`backend/routes/gallery.py`)
  - [ ] Convert all SQLAlchemy queries to Supabase client

- [ ] **4.6 Update Activities Routes** (`backend/routes/activities.py`)
  - [ ] Convert all SQLAlchemy queries to Supabase client

- [ ] **4.7 Update Newsletters Routes** (`backend/routes/newsletters.py`)
  - [ ] Convert all SQLAlchemy queries to Supabase client

- [ ] **4.8 Update Facilities Routes** (`backend/routes/facilities.py`)
  - [ ] Convert all SQLAlchemy queries to Supabase client

- [ ] **4.9 Update Downloads Routes** (`backend/routes/downloads.py`)
  - [ ] Convert all SQLAlchemy queries to Supabase client

- [ ] **4.10 Update Contacts Routes** (`backend/routes/contact.py`)
  - [ ] Convert all SQLAlchemy queries to Supabase client

- [ ] **4.11 Update Conferences Routes** (`backend/routes/conferences.py`)
  - [ ] Convert all SQLAlchemy queries to Supabase client

- [ ] **4.12 Update main.py**
  - [ ] Remove SQLAlchemy migrations (if any)
  - [ ] Keep seed functions (they now use Supabase client)
  - [ ] Verify all imports work

---

## Phase 5: Storage & File Uploads

- [ ] **5.1 Update File Upload Routes**
  - In `backend/routes/members.py` (and other file upload routes)
  - Replace local file saving with Supabase Storage:
  ```python
  # OLD: Save to local uploads/ folder
  # NEW: Upload to Supabase Storage
  supabase.storage.from_("members").upload(f"profiles/{filename}", file)
  ```

- [ ] **5.2 Update File Serving**
  - Replace local file URLs with Supabase CDN URLs
  - Format: `https://xxxxx.supabase.co/storage/v1/object/public/bucket/path`

- [ ] **5.3 Test File Upload/Download**
  - [ ] Upload member image
  - [ ] Verify file appears in Storage
  - [ ] Verify download link works

---

## Phase 6: Frontend Updates

- [ ] **6.1 Update Frontend .env** (if needed)
  ```env
  VITE_API_URL=http://localhost:8000/api
  # or for production:
  # VITE_API_URL=https://your-domain.com/api
  ```

- [ ] **6.2 Test API Endpoints**
  - [ ] GET /api/members (public)
  - [ ] GET /api/galleries (public)
  - [ ] GET /api/activities (public)
  - [ ] POST /api/auth/login (protected)
  - [ ] POST /api/members (protected)
  - [ ] POST /api/contact (public)

---

## Phase 7: Testing & Validation

- [ ] **7.1 Start Backend Server**
  ```bash
  cd backend
  uvicorn main:app --reload
  ```

- [ ] **7.2 Start Frontend Dev Server**
  ```bash
  cd frontend
  npm install
  npm run dev
  ```

- [ ] **7.3 Test Public Pages**
  - [ ] Home page loads
  - [ ] Members list shows all members
  - [ ] Gallery displays images
  - [ ] Activities page works
  - [ ] Facilities page works
  - [ ] Downloads page works
  - [ ] Contact form submits

- [ ] **7.4 Test Admin Panel**
  - [ ] Admin login works
  - [ ] Can view all members
  - [ ] Can create new member
  - [ ] Can edit member
  - [ ] Can delete member
  - [ ] Can upload member image
  - [ ] Can manage gallery
  - [ ] Can manage activities
  - [ ] Can manage newsletters
  - [ ] Can manage facilities
  - [ ] Can manage downloads

- [ ] **7.5 Performance Testing**
  - [ ] Check query response times
  - [ ] Test with multiple concurrent users
  - [ ] Monitor Supabase dashboard for slow queries

---

## Phase 8: Security & RLS

- [ ] **8.1 Enable Row-Level Security (RLS)**
  - Already configured in migration SQL
  - Verify in Supabase → Authentication → Policies

- [ ] **8.2 Test RLS**
  - [ ] Public user can read public tables
  - [ ] Public user cannot modify records
  - [ ] Admin user can modify records
  - [ ] Unauthenticated contact submission works

- [ ] **8.3 Update CORS**
  - In Supabase dashboard → Project Settings → API
  - Add frontend URL to allowed origins

- [ ] **8.4 Secure Secrets**
  - [ ] Never commit `.env` to git
  - [ ] Use service role key only on backend
  - [ ] Rotate keys if exposed
  - [ ] Use environment-specific credentials

---

## Phase 9: Deployment

- [ ] **9.1 Prepare Production Environment**
  - Create production Supabase project (or use separate database)
  - Update production `.env` with prod credentials

- [ ] **9.2 Deploy Backend**
  - Update server `.env` with Supabase credentials
  - Deploy to production server
  - Verify health check: `GET /api/health`

- [ ] **9.3 Deploy Frontend**
  - Build: `npm run build`
  - Deploy to hosting (Vercel, Netlify, etc.)
  - Update API URL in production env

- [ ] **9.4 Verify Production**
  - [ ] Test all pages load
  - [ ] Test API endpoints respond
  - [ ] Check Supabase metrics dashboard
  - [ ] Monitor error logs

---

## Phase 10: Cleanup & Optimization

- [ ] **10.1 Clean Up Old SQLite**
  - [ ] Keep `app.db` as backup (don't delete yet)
  - [ ] Remove from production if running well
  - [ ] Archive for disaster recovery

- [ ] **10.2 Remove Old Dependencies** (optional)
  ```bash
  pip uninstall sqlalchemy greenlet pymysql
  ```

- [ ] **10.3 Optimize Queries**
  - Review slow queries in Supabase dashboard
  - Add indexes if needed
  - Consider pagination for large tables

- [ ] **10.4 Setup Monitoring**
  - Enable Supabase logs
  - Setup alerts for failed connections
  - Monitor storage usage

---

## Phase 11: Documentation & Handoff

- [ ] **11.1 Document Setup**
  - Update README with Supabase setup steps
  - Document environment variables
  - Document new database structure

- [ ] **11.2 Create Runbook**
  - How to add new tables
  - How to manage users
  - How to backup data
  - How to restore from backup

- [ ] **11.3 Team Training**
  - Walk team through Supabase dashboard
  - Explain RLS policies
  - Show how to query data

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid API key" | Verify SUPABASE_KEY and SUPABASE_URL in .env |
| "CORS error" | Add frontend URL to Supabase allowed origins |
| "Connection timeout" | Check firewall, verify Supabase project is running |
| "Data not appearing" | Check RLS policies, verify user authentication |
| "File upload fails" | Check storage bucket permissions, file size limits |
| "Slow queries" | Check indexes, review query patterns in dashboard |

---

## Rollback Plan

If critical issues occur:

1. **Immediate**: Revert backend code to use SQLite
   ```bash
   git checkout HEAD~1 backend/database.py backend/routes/
   ```

2. **Restart with SQLite**: Remove Supabase clients and use local DB
   ```bash
   pip uninstall supabase
   # Restore database.py from backup
   ```

3. **Notify users**: Explain migration pause

4. **Root cause analysis**: Debug issues before retrying

5. **Retry**: Fix issues and re-attempt migration

---

## Success Criteria

✅ **Migration is complete when:**
- All tables exist in Supabase with data
- All API endpoints work with Supabase backend
- Public pages display correctly
- Admin panel functions normally
- File uploads/downloads work
- RLS policies protect sensitive data
- Performance is equal or better than SQLite
- No errors in application logs
- Team is trained on new system

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Next Review**: After Phase 11 completion
