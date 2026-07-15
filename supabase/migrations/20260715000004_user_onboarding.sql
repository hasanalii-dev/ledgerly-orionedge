create table public.user_onboarding (
  id uuid primary key references auth.users(id) on delete cascade,
  country text,
  purpose text,
  company_name text,
  role text,
  team_size text,
  created_at timestamptz not null default now()
);
alter table public.user_onboarding enable row level security;
create policy "admin can view onboarding" on public.user_onboarding for select using ((select email from auth.users where id = auth.uid()) = 'hasanalijaffe@gmail.com');
create policy "users can insert own onboarding" on public.user_onboarding for insert with check (auth.uid() = id);

grant select, insert, update, delete on public.user_onboarding to authenticated;
grant select, insert, update, delete on public.user_onboarding to anon;
grant all on public.user_onboarding to service_role;
