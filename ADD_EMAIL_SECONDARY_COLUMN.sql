-- Supabase SQL Migration: Add email_secondary column to members table
-- Run this in Supabase Console > SQL Editor

-- Add email_secondary column if it doesn't exist
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS email_secondary TEXT DEFAULT '';

-- Verify the column was created
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name='members' AND column_name='email_secondary';
