-- Add support for two separate member email IDs in Supabase
-- Run this in Supabase SQL Editor

alter table if exists public.members
add column if not exists email_secondary text default '';

-- Backfill from legacy combined email strings like:
--   primary@example.com, secondary@example.com
update public.members
set
  email = trim(split_part(email, ',', 1)),
  email_secondary = case
    when strpos(email, ',') > 0 then trim(split_part(email, ',', 2))
    else coalesce(email_secondary, '')
  end
where coalesce(email, '') <> '';

-- Optional cleanup to ensure no nulls in the new column
update public.members
set email_secondary = ''
where email_secondary is null;
