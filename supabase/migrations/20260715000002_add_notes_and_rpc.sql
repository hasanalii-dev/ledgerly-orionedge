alter table public.income_entries add column if not exists notes text;
alter table public.expense_entries add column if not exists notes text;

create or replace function public.get_pending_invites_with_details(p_email text)
returns table (
  id uuid,
  planner_id uuid,
  inviter_id uuid,
  invitee_email text,
  role text,
  status text,
  created_at timestamptz,
  planner_name text,
  inviter_email text
)
language plpgsql security definer
as $$
begin
  return query
  select 
    pi.id,
    pi.planner_id,
    pi.inviter_id,
    pi.invitee_email,
    pi.role,
    pi.status,
    pi.created_at,
    p.name as planner_name,
    u.email as inviter_email
  from planner_invites pi
  join planners p on p.id = pi.planner_id
  join auth.users u on u.id = pi.inviter_id
  where pi.invitee_email = p_email and pi.status = 'pending';
end;
$$;
