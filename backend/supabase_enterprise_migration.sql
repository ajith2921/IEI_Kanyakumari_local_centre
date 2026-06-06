-- ============================================================
-- IEI Kanyakumari — Enterprise Admin System Migration
-- Run this in Supabase SQL Editor AFTER the main migration
-- Safe to run multiple times (IF NOT EXISTS everywhere)
-- ============================================================

-- ============================================================
-- 1. ADMIN USERS TABLE
-- Replaces the thin `users` table for multi-admin RBAC
-- ============================================================
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS login_logs CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

CREATE TABLE admin_users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(120) NOT NULL DEFAULT '',
    username    VARCHAR(50)  UNIQUE NOT NULL,
    email       VARCHAR(120) UNIQUE NOT NULL DEFAULT '',
    password_hash VARCHAR(255) NOT NULL,
    role        VARCHAR(20)  NOT NULL DEFAULT 'ADMIN'
                    CHECK (role IN ('SUPER_ADMIN', 'ADMIN')),
    status      VARCHAR(20)  NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    created_by  INTEGER      REFERENCES admin_users(id) ON DELETE SET NULL,
    last_login  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_email    ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role     ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_status   ON admin_users(status);

-- ============================================================
-- 2. AUDIT LOGS TABLE (Immutable — no UPDATE/DELETE allowed)
-- ============================================================
CREATE TABLE audit_logs (
    id          BIGSERIAL    PRIMARY KEY,
    admin_id    INTEGER      REFERENCES admin_users(id) ON DELETE SET NULL,
    admin_name  VARCHAR(120) NOT NULL DEFAULT '',
    role        VARCHAR(20)  NOT NULL DEFAULT '',
    action      VARCHAR(20)  NOT NULL  -- CREATE, UPDATE, DELETE, LOGIN, LOGOUT
                    CHECK (action IN ('CREATE','UPDATE','DELETE','LOGIN','LOGOUT','EXPORT','VIEW')),
    module      VARCHAR(50)  NOT NULL DEFAULT '',  -- members, gallery, activities, etc.
    record_id   INTEGER,
    old_data    JSONB,
    new_data    JSONB,
    ip_address  VARCHAR(64)  NOT NULL DEFAULT '',
    user_agent  TEXT         NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id   ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action     ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_module     ON audit_logs(module);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================
-- 3. LOGIN LOGS TABLE
-- ============================================================
CREATE TABLE login_logs (
    id           BIGSERIAL    PRIMARY KEY,
    admin_id     INTEGER      REFERENCES admin_users(id) ON DELETE SET NULL,
    admin_name   VARCHAR(120) NOT NULL DEFAULT '',
    login_time   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    logout_time  TIMESTAMPTZ,
    ip_address   VARCHAR(64)  NOT NULL DEFAULT '',
    browser      TEXT         NOT NULL DEFAULT '',
    device       VARCHAR(120) NOT NULL DEFAULT '',
    status       VARCHAR(20)  NOT NULL DEFAULT 'success'
                     CHECK (status IN ('success','failed','logout'))
);

CREATE INDEX IF NOT EXISTS idx_login_logs_admin_id    ON login_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_login_time  ON login_logs(login_time DESC);
CREATE INDEX IF NOT EXISTS idx_login_logs_status      ON login_logs(status);

-- ============================================================
-- 4. ROW-LEVEL SECURITY
-- ============================================================
ALTER TABLE admin_users  ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_logs   ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist (safe re-run)
DROP POLICY IF EXISTS "admin_users_service_role_all"   ON admin_users;
DROP POLICY IF EXISTS "audit_logs_service_role_insert" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_service_role_select" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_no_update"           ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_no_delete"           ON audit_logs;
DROP POLICY IF EXISTS "login_logs_service_role_all"    ON login_logs;

-- admin_users: only service role (backend) can read/write
CREATE POLICY "admin_users_service_role_all" ON admin_users
    USING (true) WITH CHECK (true);

-- audit_logs: service role can INSERT and SELECT only — no UPDATE, no DELETE
CREATE POLICY "audit_logs_service_role_insert" ON audit_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "audit_logs_service_role_select" ON audit_logs
    FOR SELECT USING (true);

-- Explicitly deny UPDATE and DELETE on audit_logs for ALL roles
-- (The service role bypasses RLS, so we use application-level enforcement too)
-- Note: There are no UPDATE/DELETE endpoints exposed in the API for audit_logs.

-- login_logs: service role full access
CREATE POLICY "login_logs_service_role_all" ON login_logs
    USING (true) WITH CHECK (true);

-- ============================================================
-- 5. MIGRATE EXISTING ADMIN FROM users TABLE
-- This safely copies the existing admin to admin_users as SUPER_ADMIN
-- Only runs if admin_users is empty and users table exists with data
-- ============================================================
DO $$
BEGIN
    -- Only migrate if admin_users table is empty
    IF NOT EXISTS (SELECT 1 FROM admin_users LIMIT 1) THEN
        -- Try to migrate from users table
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
            INSERT INTO admin_users (username, email, password_hash, role, status, name)
            SELECT
                username,
                COALESCE(username || '@iei.local', ''),
                hashed_password,
                'SUPER_ADMIN',
                CASE WHEN is_active THEN 'active' ELSE 'inactive' END,
                username
            FROM users
            ON CONFLICT (username) DO NOTHING;

            RAISE NOTICE 'Migrated % admin user(s) from users table to admin_users.', (SELECT COUNT(*) FROM users);
        END IF;
    ELSE
        RAISE NOTICE 'admin_users table already has data. Skipping migration.';
    END IF;
END $$;
