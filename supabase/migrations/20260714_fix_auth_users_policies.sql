-- Fix bug_reports policies
drop policy if exists "admin can view all bug reports" on public.bug_reports;
drop policy if exists "admin can manage bug reports" on public.bug_reports;

create policy "admin can view all bug reports" on public.bug_reports
  for select using (
    auth.jwt() ->> 'email' = 'hasanalijaffe@gmail.com'
  );

create policy "admin can manage bug reports" on public.bug_reports
  for all using (
    auth.jwt() ->> 'email' = 'hasanalijaffe@gmail.com'
  ) with check (
    auth.jwt() ->> 'email' = 'hasanalijaffe@gmail.com'
  );

-- Fix site_analytics policy
drop policy if exists "admin can read analytics" on public.site_analytics;
create policy "admin can read analytics" on public.site_analytics 
  for select using (
    auth.jwt() ->> 'email' = 'hasanalijaffe@gmail.com'
  );

-- Fix planner_invites policies
drop policy if exists "view invites" on public.planner_invites;
drop policy if exists "manage invites" on public.planner_invites;

create policy "view invites" on public.planner_invites
  for select using (
    inviter_id = auth.uid() or 
    invitee_email = auth.jwt() ->> 'email'
  );

create policy "manage invites" on public.planner_invites
  for all using (
    inviter_id = auth.uid() or
    invitee_email = auth.jwt() ->> 'email'
  ) with check (
    inviter_id = auth.uid() or
    invitee_email = auth.jwt() ->> 'email'
  );
