-- 1. Create the get_collaborator_details function (needed for avatars in the header)
drop function if exists public.get_collaborator_details(uuid);
create or replace function public.get_collaborator_details(p_planner_id uuid)
returns table(id uuid, email text, display_name text, avatar_url text, role text)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select 
    u.id, 
    u.email::text, 
    p.display_name, 
    p.avatar_url, 
    'owner'::text as role
  from auth.users u
  left join public.profiles p on p.id = u.id
  join public.planners pl on pl.user_id = u.id
  where pl.id = p_planner_id
  union all
  select 
    u.id, 
    u.email::text, 
    p.display_name, 
    p.avatar_url, 
    pc.role
  from auth.users u
  left join public.profiles p on p.id = u.id
  join public.planner_collaborators pc on pc.user_id = u.id
  where pc.planner_id = p_planner_id;
end;
$$;

-- 2. Prevent RLS recursion 500 errors by switching wrapper functions to plpgsql 
-- (LANGUAGE sql functions get inlined by Postgres, which ignores security definer)
create or replace function public.is_planner_owner(p_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  return exists(select 1 from planners where id = p_id and user_id = auth.uid());
end;
$$;

create or replace function public.is_planner_collaborator(p_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  return exists(select 1 from planner_collaborators where planner_id = p_id and user_id = auth.uid());
end;
$$;

create or replace function public.is_planner_editor(p_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  return exists(select 1 from planner_collaborators where planner_id = p_id and user_id = auth.uid() and role = 'editor');
end;
$$;
