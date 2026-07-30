-- Fix ad_slots RLS policy: use auth.jwt() instead of querying auth.users directly
-- The previous policy caused "permission denied for table users" because
-- authenticated users cannot SELECT from auth.users

drop policy if exists "admin can manage ad slots" on public.ad_slots;
create policy "admin can manage ad slots" on public.ad_slots
  for all using (
    (auth.jwt() ->> 'email') = 'hasanalijaffe@gmail.com'
  )
  with check (
    (auth.jwt() ->> 'email') = 'hasanalijaffe@gmail.com'
  );
