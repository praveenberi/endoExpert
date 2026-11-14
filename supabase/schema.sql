-- ENDO EXPERT – Supabase schema. Run in the Supabase SQL editor.
-- After creating your admin user in Authentication → Users, run:
--   insert into admin_users (user_id, role) values ('<that user uuid>', 'admin');

create table if not exists admin_users (
  user_id uuid primary key references auth.users on delete cascade,
  role text not null default 'staff' check (role in ('admin','staff'))
);

create or replace function is_admin() returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from admin_users where user_id = auth.uid());
$$;

-- Website content (single row). draft = being edited, published = live.
create table if not exists site_content (
  id int primary key default 1 check (id = 1),
  draft jsonb,
  published jsonb,
  updated_at timestamptz default now()
);
create table if not exists content_revisions (
  id uuid primary key default gen_random_uuid(),
  label text,
  content jsonb not null,
  created_at timestamptz default now()
);
create table if not exists media (
  id text primary key,
  path text,
  url text not null,
  alt text default '',
  category text default 'general',
  created_at timestamptz default now()
);
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
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

alter table admin_users enable row level security;
alter table site_content enable row level security;
alter table content_revisions enable row level security;
alter table media enable row level security;
alter table appointments enable row level security;

-- Public can read ONLY the published JSON (never the draft).
create or replace function get_published() returns jsonb
language sql security definer set search_path = public stable as $$
  select published from site_content where id = 1;
$$;
grant execute on function get_published() to anon, authenticated;

create policy "admin all content" on site_content for all using (is_admin()) with check (is_admin());
create policy "public read published" on site_content for select using (published is not null and true);
create policy "admin all revisions" on content_revisions for all using (is_admin()) with check (is_admin());
create policy "public read media" on media for select using (true);
create policy "admin write media" on media for all using (is_admin()) with check (is_admin());
create policy "admin all appointments" on appointments for all using (is_admin()) with check (is_admin());
create policy "admin read admin_users" on admin_users for select using (is_admin());

-- NOTE: the "public read published" policy exposes the whole row (incl. draft) to select.
-- To keep drafts private, revoke column access for anon:
revoke select on site_content from anon;
grant select (id, published, updated_at) on site_content to anon;

-- Booking RPCs (security definer so patients never need table access).
create or replace function booked_slots(p_date date) returns table (slot_time time)
language sql security definer set search_path = public stable as $$
  select time from appointments where date = p_date and status in ('pending','confirmed');
$$;

create or replace function create_appointment(
  p_name text, p_mobile text, p_email text, p_treatment text, p_date date, p_time time, p_message text
) returns text language plpgsql security definer set search_path = public as $$
declare r text := upper(substr(md5(random()::text), 1, 6));
begin
  if extract(dow from p_date) = 0 then raise exception 'Sunday bookings are not available'; end if;
  if p_date < current_date then raise exception 'Date is in the past'; end if;
  if length(trim(p_name)) < 2 or length(regexp_replace(p_mobile, '\D', '', 'g')) < 8 then raise exception 'Invalid details'; end if;
  begin
    insert into appointments (ref, name, mobile, email, treatment, date, time, message)
    values (r, trim(p_name), regexp_replace(p_mobile, '\D', '', 'g'), p_email, p_treatment, p_date, p_time, p_message);
  exception when unique_violation then raise exception 'slot taken';
  end;
  return r;
end $$;

create or replace function lookup_appointment(p_ref text, p_mobile text)
returns table (ref text, name text, treatment text, date date, "time" time, status text)
language sql security definer set search_path = public stable as $$
  select ref, name, treatment, date, time, status from appointments
  where ref = p_ref and mobile = regexp_replace(p_mobile, '\D', '', 'g');
$$;

create or replace function cancel_appointment(p_ref text, p_mobile text) returns void
language sql security definer set search_path = public as $$
  update appointments set status = 'cancelled'
  where ref = p_ref and mobile = regexp_replace(p_mobile, '\D', '', 'g') and status in ('pending','confirmed');
$$;

grant execute on function booked_slots(date), create_appointment(text,text,text,text,date,time,text),
  lookup_appointment(text,text), cancel_appointment(text,text) to anon, authenticated;

-- Storage bucket for photos/videos (public read, admin write).
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict do nothing;
create policy "public read media files" on storage.objects for select using (bucket_id = 'media');
create policy "admin write media files" on storage.objects for all
  using (bucket_id = 'media' and is_admin()) with check (bucket_id = 'media' and is_admin());
