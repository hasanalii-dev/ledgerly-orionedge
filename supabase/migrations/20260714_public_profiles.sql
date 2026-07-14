-- Allow all authenticated users to view profiles so avatars can be rendered
drop policy if exists "public profiles" on public.profiles;
create policy "public profiles" on public.profiles
  for select using (true);
