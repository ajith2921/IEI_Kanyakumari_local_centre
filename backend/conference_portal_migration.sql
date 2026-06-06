-- ============================================================
-- IEI Conference Portal — Extended Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ── 1. Important Dates ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS conference_dates (
    id SERIAL PRIMARY KEY,
    conference_id INTEGER REFERENCES conferences(id) ON DELETE CASCADE,
    label VARCHAR(120) NOT NULL,         -- e.g. "Abstract Submission"
    date_value VARCHAR(40) NOT NULL,     -- stored as string for flexibility
    is_extended BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_conf_dates_conf ON conference_dates(conference_id);

-- ── 2. Speakers ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conference_speakers (
    id SERIAL PRIMARY KEY,
    conference_id INTEGER REFERENCES conferences(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    designation VARCHAR(200) DEFAULT '',
    organization VARCHAR(200) DEFAULT '',
    country VARCHAR(80) DEFAULT '',
    bio TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    speaker_type VARCHAR(30) DEFAULT 'keynote',  -- keynote | invited
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_conf_speakers_conf ON conference_speakers(conference_id);

-- ── 3. Committees ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conference_committees (
    id SERIAL PRIMARY KEY,
    conference_id INTEGER REFERENCES conferences(id) ON DELETE CASCADE,
    member_name VARCHAR(150) NOT NULL,
    designation VARCHAR(200) DEFAULT '',
    organization VARCHAR(200) DEFAULT '',
    role VARCHAR(80) NOT NULL,   -- e.g. "Patron", "Chairman", "Technical Committee"
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_conf_committees_conf ON conference_committees(conference_id);

-- ── 4. Registration Submissions ─────────────────────────────
CREATE TABLE IF NOT EXISTS conference_registrations (
    id SERIAL PRIMARY KEY,
    conference_id INTEGER REFERENCES conferences(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(120) NOT NULL,
    phone VARCHAR(30) DEFAULT '',
    organization VARCHAR(200) DEFAULT '',
    designation VARCHAR(120) DEFAULT '',
    category VARCHAR(60) NOT NULL,   -- Student | Faculty | IEI Member | etc.
    paper_title VARCHAR(300) DEFAULT '',
    payment_ref VARCHAR(100) DEFAULT '',
    payment_screenshot_url TEXT DEFAULT '',
    status VARCHAR(20) DEFAULT 'pending',  -- pending | approved | rejected
    remarks TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_conf_reg_conf ON conference_registrations(conference_id);
CREATE INDEX IF NOT EXISTS idx_conf_reg_status ON conference_registrations(status);

-- ── 5. Paper Submissions ────────────────────────────────────
CREATE TABLE IF NOT EXISTS conference_submissions (
    id SERIAL PRIMARY KEY,
    conference_id INTEGER REFERENCES conferences(id) ON DELETE CASCADE,
    author_name VARCHAR(150) NOT NULL,
    co_authors VARCHAR(300) DEFAULT '',
    email VARCHAR(120) NOT NULL,
    organization VARCHAR(200) DEFAULT '',
    paper_title VARCHAR(300) NOT NULL,
    abstract TEXT DEFAULT '',
    keywords VARCHAR(300) DEFAULT '',
    track VARCHAR(150) DEFAULT '',
    pdf_url TEXT DEFAULT '',
    status VARCHAR(30) DEFAULT 'submitted', -- submitted|under_review|accepted|rejected|camera_ready
    reviewer_comments TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_conf_sub_conf ON conference_submissions(conference_id);
CREATE INDEX IF NOT EXISTS idx_conf_sub_status ON conference_submissions(status);

-- ── 6. Program Schedule ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS conference_schedule (
    id SERIAL PRIMARY KEY,
    conference_id INTEGER REFERENCES conferences(id) ON DELETE CASCADE,
    day_label VARCHAR(60) NOT NULL,       -- e.g. "Day 1 — 30 Oct 2026"
    start_time VARCHAR(20) DEFAULT '',
    end_time VARCHAR(20) DEFAULT '',
    session_title VARCHAR(250) NOT NULL,
    speaker_name VARCHAR(150) DEFAULT '',
    session_type VARCHAR(40) DEFAULT 'session',  -- session|keynote|workshop|break|panel
    venue_room VARCHAR(100) DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_conf_schedule_conf ON conference_schedule(conference_id);

-- ── 7. Sponsors ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conference_sponsors (
    id SERIAL PRIMARY KEY,
    conference_id INTEGER REFERENCES conferences(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    logo_url TEXT DEFAULT '',
    website_url TEXT DEFAULT '',
    category VARCHAR(60) DEFAULT 'sponsor',  -- title|gold|silver|bronze|academic|industry
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_conf_sponsors_conf ON conference_sponsors(conference_id);

-- ── 8. Conference Downloads ─────────────────────────────────
CREATE TABLE IF NOT EXISTS conference_downloads (
    id SERIAL PRIMARY KEY,
    conference_id INTEGER REFERENCES conferences(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT DEFAULT '',
    file_url TEXT DEFAULT '',
    file_type VARCHAR(40) DEFAULT 'pdf',   -- pdf|doc|zip
    category VARCHAR(60) DEFAULT 'general', -- brochure|cfp|template|schedule|guidelines
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_conf_downloads_conf ON conference_downloads(conference_id);

-- ── 9. Conference Gallery ───────────────────────────────────
CREATE TABLE IF NOT EXISTS conference_gallery (
    id SERIAL PRIMARY KEY,
    conference_id INTEGER REFERENCES conferences(id) ON DELETE CASCADE,
    title VARCHAR(150) DEFAULT '',
    image_url TEXT NOT NULL,
    album_label VARCHAR(100) DEFAULT '',  -- e.g. "2026", "2025 Highlights"
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_conf_gallery_conf ON conference_gallery(conference_id);

-- ── 10. FAQ ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conference_faq (
    id SERIAL PRIMARY KEY,
    conference_id INTEGER REFERENCES conferences(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_conf_faq_conf ON conference_faq(conference_id);

-- ── 11. Call For Papers Tracks ──────────────────────────────
CREATE TABLE IF NOT EXISTS conference_tracks (
    id SERIAL PRIMARY KEY,
    conference_id INTEGER REFERENCES conferences(id) ON DELETE CASCADE,
    track_name VARCHAR(200) NOT NULL,
    description TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_conf_tracks_conf ON conference_tracks(conference_id);

-- ── 12. Venue ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conference_venue (
    id SERIAL PRIMARY KEY,
    conference_id INTEGER REFERENCES conferences(id) ON DELETE CASCADE,
    venue_name VARCHAR(200) NOT NULL,
    address TEXT DEFAULT '',
    city VARCHAR(80) DEFAULT '',
    state VARCHAR(80) DEFAULT '',
    pincode VARCHAR(20) DEFAULT '',
    map_embed_url TEXT DEFAULT '',
    directions TEXT DEFAULT '',
    nearby_hotels TEXT DEFAULT '',   -- stored as text / JSON string
    image_url TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_conf_venue_conf ON conference_venue(conference_id);

-- ── RLS Policies ────────────────────────────────────────────

-- Public READ on all portal tables
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY ARRAY[
        'conference_dates','conference_speakers','conference_committees',
        'conference_schedule','conference_sponsors','conference_downloads',
        'conference_gallery','conference_faq','conference_tracks','conference_venue'
    ] LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
        EXECUTE format(
            'DROP POLICY IF EXISTS "%s_public_read" ON %I',
            tbl, tbl
        );
        EXECUTE format(
            'CREATE POLICY "%s_public_read" ON %I FOR SELECT USING (true)',
            tbl, tbl
        );
    END LOOP;
END $$;

-- Registrations: public INSERT, admin-only SELECT/DELETE
ALTER TABLE conference_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reg_public_insert" ON conference_registrations;
CREATE POLICY "reg_public_insert" ON conference_registrations
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "reg_admin_select" ON conference_registrations;
CREATE POLICY "reg_admin_select" ON conference_registrations
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "reg_admin_delete" ON conference_registrations;
CREATE POLICY "reg_admin_delete" ON conference_registrations
    FOR DELETE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "reg_admin_update" ON conference_registrations;
CREATE POLICY "reg_admin_update" ON conference_registrations
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Submissions: public INSERT, admin-only SELECT/UPDATE/DELETE
ALTER TABLE conference_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sub_public_insert" ON conference_submissions;
CREATE POLICY "sub_public_insert" ON conference_submissions
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "sub_admin_select" ON conference_submissions;
CREATE POLICY "sub_admin_select" ON conference_submissions
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "sub_admin_update" ON conference_submissions;
CREATE POLICY "sub_admin_update" ON conference_submissions
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "sub_admin_delete" ON conference_submissions;
CREATE POLICY "sub_admin_delete" ON conference_submissions
    FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- Done! All 12 conference portal tables created.
-- ============================================================
