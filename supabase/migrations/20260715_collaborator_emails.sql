create or replace function get_planner_collaborators(p_id uuid)
returns table(id uuid, display_name text, avatar_url text, email text)
language plpgsql
security definer
as $$
begin
  if not exists (
    select 1 from planners p where p.id = p_id and p.user_id = auth.uid()
    union
    select 1 from planner_collaborators c where c.planner_id = p_id and c.user_id = auth.uid()
  ) then
    raise exception 'Access denied';
  end if;

  return query
    select p.id, p.display_name, p.avatar_url, u.email::text
    from profiles p
    join auth.users u on u.id = p.id
    where p.id = (select user_id from planners where id = p_id)
       or p.id in (select user_id from planner_collaborators where planner_id = p_id);
end;
$$;
