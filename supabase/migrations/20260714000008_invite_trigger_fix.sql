create or replace function public.handle_invite_accepted()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Only act if status changed to 'accepted'
  if new.status = 'accepted' and old.status != 'accepted' then
    -- Because the person clicking "Accept" is the invitee, auth.uid() is THEIR id!
    if auth.uid() is not null then
      insert into public.planner_collaborators (planner_id, user_id, role)
      values (new.planner_id, auth.uid(), new.role)
      on conflict (planner_id, user_id) do update set role = excluded.role;
    end if;
  end if;
  return new;
end;
$$;
