-- Allow admin to view all bug reports
create policy "admin can view all bug reports" on public.bug_reports
  for select using (
    (select email from auth.users where id = auth.uid()) = 'hasanalijaffe@gmail.com'
  );

-- Allow admin to update/delete bug reports (e.g. resolve)
create policy "admin can manage bug reports" on public.bug_reports
  for all using (
    (select email from auth.users where id = auth.uid()) = 'hasanalijaffe@gmail.com'
  ) with check (
    (select email from auth.users where id = auth.uid()) = 'hasanalijaffe@gmail.com'
  );
