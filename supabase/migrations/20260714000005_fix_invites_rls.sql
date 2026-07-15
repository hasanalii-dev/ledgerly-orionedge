-- Fix planner_invites policies that query auth.users
drop policy if exists "view invites" on public.planner_invites;
drop policy if exists "manage invites" on public.planner_invites;

create policy "view invites" on public.planner_invites
  for select using (
    inviter_id = auth.uid() or 
    invitee_email = (auth.jwt() ->> 'email')
  );

create policy "manage invites" on public.planner_invites
  for all using (
    inviter_id = auth.uid() or
    invitee_email = (auth.jwt() ->> 'email')
  ) with check (
    inviter_id = auth.uid() or
    invitee_email = (auth.jwt() ->> 'email')
  );
