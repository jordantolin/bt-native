-- Creates the bubbles table if it does not exist
create table if not exists public.bubbles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  topic text,
  description text,
  user_id uuid references auth.users(id),
  created_at timestamp with time zone default now()
);
