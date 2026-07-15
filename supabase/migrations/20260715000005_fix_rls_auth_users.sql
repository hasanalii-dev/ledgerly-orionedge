
-- Fix planner_invites policies
drop policy if exists "users can view their own invites" on public.planner_invites;
create policy "users can view their own invites" on public.planner_invites for select using (
  invitee_email = (select auth.jwt() ->> 'email')
  or
  inviter_id = auth.uid()
);

drop policy if exists "users can update their own invites" on public.planner_invites;
create policy "users can update their own invites" on public.planner_invites for update using (
  invitee_email = (select auth.jwt() ->> 'email')
);

-- Fix bug_reports policies
drop policy if exists "admin can view bug reports" on public.bug_reports;
create policy "admin can view bug reports" on public.bug_reports for select using (
  (select auth.jwt() ->> 'email') = 'hasanalijaffe@gmail.com'
);

drop policy if exists "admin can update bug reports" on public.bug_reports;
create policy "admin can update bug reports" on public.bug_reports for update using (
  (select auth.jwt() ->> 'email') = 'hasanalijaffe@gmail.com'
);

drop policy if exists "admin can delete bug reports" on public.bug_reports;
create policy "admin can delete bug reports" on public.bug_reports for delete using (
  (select auth.jwt() ->> 'email') = 'hasanalijaffe@gmail.com'
);

-- Fix site_analytics policies
drop policy if exists "admin can read analytics" on public.site_analytics;
create policy "admin can read analytics" on public.site_analytics for select using (
  (select auth.jwt() ->> 'email') = 'hasanalijaffe@gmail.com'
);

-- Fix user_onboarding policies
drop policy if exists "admin can view onboarding" on public.user_onboarding;
create policy "admin can view onboarding" on public.user_onboarding for select using (
  (select auth.jwt() ->> 'email') = 'hasanalijaffe@gmail.com'
);

