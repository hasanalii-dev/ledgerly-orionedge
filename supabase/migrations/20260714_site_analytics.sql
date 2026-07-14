create table public.site_analytics (
  id uuid primary key default gen_random_uuid(),
  event_type text not null, -- 'page_view'
  page_path text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

grant insert on public.site_analytics to anon, authenticated;
grant select on public.site_analytics to authenticated;
grant all on public.site_analytics to service_role;

alter table public.site_analytics enable row level security;

-- Anyone can insert
create policy "anyone can insert analytics" on public.site_analytics 
  for insert with check (true);

-- Only admin can read
create policy "admin can read analytics" on public.site_analytics 
  for select using (
    (select email from auth.users where id = auth.uid()) = 'hasanalijaffe@gmail.com'
  );
