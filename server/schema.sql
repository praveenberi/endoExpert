-- ENDO EXPERT – PostgreSQL schema. Idempotent: the server runs it on every start.

create table if not exists admin_users (
  id serial primary key,
  email text unique not null,
  password_hash text not null,
  created_at timestamptz default now()
);

-- Website content (single row). draft = being edited, published = live.
create table if not exists site_content (
  id int primary key default 1 check (id = 1),
  draft jsonb,
  published jsonb,
  updated_at timestamptz default now()
);

create table if not exists content_revisions (
  id bigserial primary key,
  label text,
  content jsonb not null,
  created_at timestamptz default now()
);

-- Uploaded photos / videos are stored in the database so no extra file storage is needed.
create table if not exists media (
  id text primary key,
  name text default '',
  alt text default '',
  category text default 'general',
  mime text not null,
  data bytea not null,
  created_at timestamptz default now()
);

create table if not exists appointments (
  id bigserial primary key,
  ref text unique not null,
  name text not null,
  mobile text not null,
  email text default '',
  treatment text default '',
  date date not null,
  time time not null,
  message text default '',
  status text not null default 'pending' check (status in ('pending','confirmed','rejected','cancelled','completed')),
  created_at timestamptz default now()
);
-- One active booking per slot.
create unique index if not exists appt_slot_unique on appointments (date, time) where status in ('pending','confirmed');
