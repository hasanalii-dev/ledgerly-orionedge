-- Allow users to leave a planner by deleting their own collaborator record
drop policy if exists "leave planner" on public.planner_collaborators;
create policy "leave planner" on public.planner_collaborators
  for delete using (user_id = auth.uid());
