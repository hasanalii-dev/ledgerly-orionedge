-- Create ad_slots table for global universal ad configuration across all accounts
create table if not exists public.ad_slots (
  id text primary key,
  page text not null,
  title text not null,
  enabled boolean not null default true,
  type text not null default 'image',
  image_url text,
  target_url text,
  alt_text text,
  custom_code text,
  badge_text text,
  updated_at timestamptz not null default now()
);

-- RLS Policies
alter table public.ad_slots enable row level security;

-- Everyone can read ad slots universally
drop policy if exists "anyone can read ad slots" on public.ad_slots;
create policy "anyone can read ad slots" on public.ad_slots
  for select using (true);

-- Admin can manage ad slots
drop policy if exists "admin can manage ad slots" on public.ad_slots;
create policy "admin can manage ad slots" on public.ad_slots
  for all using (
    (select email from auth.users where id = auth.uid()) = 'hasanalijaffe@gmail.com'
  )
  with check (
    (select email from auth.users where id = auth.uid()) = 'hasanalijaffe@gmail.com'
  );

-- Grants
grant select on public.ad_slots to anon, authenticated;
grant all on public.ad_slots to authenticated, service_role;
