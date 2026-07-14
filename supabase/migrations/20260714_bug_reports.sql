create table public.bug_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  message text not null,
  logs text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.bug_reports to authenticated;
grant all on public.bug_reports to service_role;
alter table public.bug_reports enable row level security;

-- Users can insert bug reports
create policy "users can insert bug reports" on public.bug_reports
  for insert with check (auth.uid() = user_id or auth.uid() is null);

-- Users can only view their own bug reports
create policy "users can view own bug reports" on public.bug_reports
  for select using (auth.uid() = user_id);
