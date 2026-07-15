create or replace function public.handle_invite_accepted()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid;
begin
  -- Only act if status changed to 'accepted'
  if new.status = 'accepted' and old.status != 'accepted' then
    -- Find the user ID of the invitee using their email
    select id into v_user_id from auth.users where email = new.invitee_email;
    
    if v_user_id is not null then
      -- Insert them as a collaborator!
      insert into public.planner_collaborators (planner_id, user_id, role)
      values (new.planner_id, v_user_id, new.role)
      on conflict (planner_id, user_id) do update set role = excluded.role;
    end if;
  end if;
  
  return new;
end;
$$;

drop trigger if exists on_invite_accepted on public.planner_invites;
create trigger on_invite_accepted
  after update on public.planner_invites
  for each row execute function public.handle_invite_accepted();
