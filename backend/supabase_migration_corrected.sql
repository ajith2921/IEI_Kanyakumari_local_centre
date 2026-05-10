-- ========================================
-- IEI Kanyakumari Database Schema for Supabase
-- ========================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- USERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ========================================
-- MEMBERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    position VARCHAR(120) NOT NULL DEFAULT '',
    membership_id VARCHAR(80) DEFAULT '',
    address TEXT DEFAULT '',
    email VARCHAR(120) DEFAULT '',
    mobile VARCHAR(30) DEFAULT '',
    image_url VARCHAR(255) DEFAULT '',
    image VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_name ON members(name);
CREATE INDEX IF NOT EXISTS idx_members_position ON members(position);
CREATE INDEX IF NOT EXISTS idx_members_created_at ON members(created_at DESC);

-- ========================================
-- GALLERY TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS gallery (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT DEFAULT '',
    image_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gallery_created_at ON gallery(created_at DESC);

-- ========================================
-- NEWSLETTERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS newsletters (
    id SERIAL PRIMARY KEY,
    title VARCHAR(180) NOT NULL,
    summary TEXT DEFAULT '',
    pdf_url VARCHAR(255) DEFAULT '',
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_newsletters_published_at ON newsletters(published_at DESC);

-- ========================================
-- ACTIVITIES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    title VARCHAR(180) NOT NULL,
    description TEXT DEFAULT '',
    event_date VARCHAR(40) DEFAULT '',
    image_url VARCHAR(255) DEFAULT '',
    pdf_url VARCHAR(255) DEFAULT '',
    colab_url VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activities_event_date ON activities(event_date);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

-- ========================================
-- FACILITIES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS facilities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    description TEXT DEFAULT '',
    image_url VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_facilities_created_at ON facilities(created_at DESC);

-- ========================================
-- DOWNLOADS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS downloads (
    id SERIAL PRIMARY KEY,
    title VARCHAR(180) NOT NULL,
    description TEXT DEFAULT '',
    pdf_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_downloads_created_at ON downloads(created_at DESC);

-- ========================================
-- CONTACT MESSAGES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL,
    phone VARCHAR(30) DEFAULT '',
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- ========================================
-- CONFERENCES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS conferences (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    short_title VARCHAR(50) NOT NULL,
    description TEXT DEFAULT '',
    start_date VARCHAR(40) NOT NULL,
    end_date VARCHAR(40) NOT NULL,
    registration_deadline VARCHAR(40) NOT NULL,
    venue VARCHAR(200) DEFAULT '',
    button_text VARCHAR(50) DEFAULT 'More Details',
    link VARCHAR(255) DEFAULT '/conference',
    image_url VARCHAR(255) DEFAULT '',
    pdf_url VARCHAR(255) DEFAULT '',
    status VARCHAR(20) DEFAULT 'active',
    is_new BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_conferences_status ON conferences(status);
CREATE INDEX IF NOT EXISTS idx_conferences_created_at ON conferences(created_at DESC);

-- ========================================
-- AUDIT TABLE (Optional - for tracking changes)
-- ========================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(50),
    operation VARCHAR(10),
    record_id INTEGER,
    old_data JSONB,
    new_data JSONB,
    user_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ========================================
-- Row-Level Security (RLS) Policies
-- ========================================

-- Enable RLS on all tables (idempotent)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users are viewable by authenticated users only" ON users;
DROP POLICY IF EXISTS "Members are publicly readable" ON members;
DROP POLICY IF EXISTS "Only authenticated users can insert members" ON members;
DROP POLICY IF EXISTS "Only authenticated users can update members" ON members;
DROP POLICY IF EXISTS "Only authenticated users can delete members" ON members;
DROP POLICY IF EXISTS "Gallery is publicly readable" ON gallery;
DROP POLICY IF EXISTS "Only authenticated users can manage gallery" ON gallery;
DROP POLICY IF EXISTS "Only authenticated users can update gallery" ON gallery;
DROP POLICY IF EXISTS "Only authenticated users can delete gallery" ON gallery;
DROP POLICY IF EXISTS "Newsletters are publicly readable" ON newsletters;
DROP POLICY IF EXISTS "Only authenticated users can manage newsletters" ON newsletters;
DROP POLICY IF EXISTS "Only authenticated users can update newsletters" ON newsletters;
DROP POLICY IF EXISTS "Only authenticated users can delete newsletters" ON newsletters;
DROP POLICY IF EXISTS "Activities are publicly readable" ON activities;
DROP POLICY IF EXISTS "Only authenticated users can manage activities" ON activities;
DROP POLICY IF EXISTS "Only authenticated users can update activities" ON activities;
DROP POLICY IF EXISTS "Only authenticated users can delete activities" ON activities;
DROP POLICY IF EXISTS "Facilities are publicly readable" ON facilities;
DROP POLICY IF EXISTS "Only authenticated users can manage facilities" ON facilities;
DROP POLICY IF EXISTS "Only authenticated users can update facilities" ON facilities;
DROP POLICY IF EXISTS "Only authenticated users can delete facilities" ON facilities;
DROP POLICY IF EXISTS "Downloads are publicly readable" ON downloads;
DROP POLICY IF EXISTS "Only authenticated users can manage downloads" ON downloads;
DROP POLICY IF EXISTS "Only authenticated users can update downloads" ON downloads;
DROP POLICY IF EXISTS "Only authenticated users can delete downloads" ON downloads;
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_messages;
DROP POLICY IF EXISTS "Only authenticated users can read contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Only authenticated users can delete contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Conferences are publicly readable" ON conferences;
DROP POLICY IF EXISTS "Only authenticated users can manage conferences" ON conferences;
DROP POLICY IF EXISTS "Only authenticated users can update conferences" ON conferences;
DROP POLICY IF EXISTS "Only authenticated users can delete conferences" ON conferences;

-- USERS: Only admin can read (via app logic)
CREATE POLICY "Users are viewable by authenticated users only" ON users
    FOR SELECT USING (auth.role() = 'authenticated');

-- MEMBERS: Public can read, only admin can modify
CREATE POLICY "Members are publicly readable" ON members
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can insert members" ON members
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update members" ON members
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can delete members" ON members
    FOR DELETE USING (auth.role() = 'authenticated');

-- GALLERY: Public can read, admin can modify
CREATE POLICY "Gallery is publicly readable" ON gallery
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can manage gallery" ON gallery
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update gallery" ON gallery
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can delete gallery" ON gallery
    FOR DELETE USING (auth.role() = 'authenticated');

-- NEWSLETTERS: Public can read, admin can modify
CREATE POLICY "Newsletters are publicly readable" ON newsletters
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can manage newsletters" ON newsletters
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update newsletters" ON newsletters
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can delete newsletters" ON newsletters
    FOR DELETE USING (auth.role() = 'authenticated');

-- ACTIVITIES: Public can read, admin can modify
CREATE POLICY "Activities are publicly readable" ON activities
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can manage activities" ON activities
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update activities" ON activities
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can delete activities" ON activities
    FOR DELETE USING (auth.role() = 'authenticated');

-- FACILITIES: Public can read, admin can modify
CREATE POLICY "Facilities are publicly readable" ON facilities
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can manage facilities" ON facilities
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update facilities" ON facilities
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can delete facilities" ON facilities
    FOR DELETE USING (auth.role() = 'authenticated');

-- DOWNLOADS: Public can read, admin can modify
CREATE POLICY "Downloads are publicly readable" ON downloads
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can manage downloads" ON downloads
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update downloads" ON downloads
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can delete downloads" ON downloads
    FOR DELETE USING (auth.role() = 'authenticated');

-- CONTACT MESSAGES: Public can insert, admin can read/delete
CREATE POLICY "Anyone can submit contact form" ON contact_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Only authenticated users can read contact messages" ON contact_messages
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can delete contact messages" ON contact_messages
    FOR DELETE USING (auth.role() = 'authenticated');

-- CONFERENCES: Public can read, admin can modify
CREATE POLICY "Conferences are publicly readable" ON conferences
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can manage conferences" ON conferences
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update conferences" ON conferences
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can delete conferences" ON conferences
    FOR DELETE USING (auth.role() = 'authenticated');
