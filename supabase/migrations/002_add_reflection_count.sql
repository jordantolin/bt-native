-- Adds reflectionCount column with default 0 if not exists
alter table if exists public.bubbles add column if not exists reflectionCount integer default 0;
