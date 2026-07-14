-- 1. Create new tables for Collaboration

create table public.planner_collaborators (
  id uuid primary key default gen_random_uuid(),
  planner_id uuid not null references public.planners(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'viewer', -- 'viewer' or 'editor'
  created_at timestamptz not null default now(),
  unique(planner_id, user_id)
);

create table public.planner_invites (
  id uuid primary key default gen_random_uuid(),
  planner_id uuid not null references public.planners(id) on delete cascade,
  inviter_id uuid not null references auth.users(id) on delete cascade,
  invitee_email text not null,
  role text not null default 'viewer',
  status text not null default 'pending', -- 'pending', 'accepted', 'declined'
  created_at timestamptz not null default now()
);

-- Grants
grant select, insert, update, delete on public.planner_collaborators to authenticated;
grant all on public.planner_collaborators to service_role;
alter table public.planner_collaborators enable row level security;

grant select, insert, update, delete on public.planner_invites to authenticated;
grant all on public.planner_invites to service_role;
alter table public.planner_invites enable row level security;

-- Policies for collaborators
create policy "view collaborators" on public.planner_collaborators
  for select using (
    user_id = auth.uid() or 
    exists (select 1 from public.planners p where p.id = planner_id and p.user_id = auth.uid()) or
    exists (select 1 from public.planner_collaborators pc2 where pc2.planner_id = planner_id and pc2.user_id = auth.uid())
  );

-- Only owner can add/remove collaborators
create policy "manage collaborators" on public.planner_collaborators
  for all using (
    exists (select 1 from public.planners p where p.id = planner_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.planners p where p.id = planner_id and p.user_id = auth.uid())
  );

-- Policies for invites
create policy "view invites" on public.planner_invites
  for select using (
    inviter_id = auth.uid() or 
    invitee_email = (select email from auth.users where id = auth.uid())
  );

create policy "manage invites" on public.planner_invites
  for all using (
    inviter_id = auth.uid() or
    invitee_email = (select email from auth.users where id = auth.uid())
  ) with check (
    inviter_id = auth.uid() or
    invitee_email = (select email from auth.users where id = auth.uid())
  );


-- 2. Update RLS for planners

drop policy if exists "own planners" on public.planners;

create policy "view planners" on public.planners
  for select using (
    user_id = auth.uid() or
    exists (select 1 from public.planner_collaborators pc where pc.planner_id = id and pc.user_id = auth.uid())
  );

create policy "update planners" on public.planners
  for update using (
    user_id = auth.uid() or
    exists (select 1 from public.planner_collaborators pc where pc.planner_id = id and pc.user_id = auth.uid() and pc.role = 'editor')
  ) with check (
    user_id = auth.uid() or
    exists (select 1 from public.planner_collaborators pc where pc.planner_id = id and pc.user_id = auth.uid() and pc.role = 'editor')
  );

create policy "insert planners" on public.planners
  for insert with check (user_id = auth.uid());

create policy "delete planners" on public.planners
  for delete using (user_id = auth.uid());


-- 3. Update RLS for ALL child tables
do $$
declare t text;
begin
  for t in select unnest(array[
    'accounts','clients','projects','invoices','expense_categories',
    'income_entries','expense_entries','transfers','investments','goals',
    'budgets','notes','doc_folders','documents','payment_proofs','receipts',
    'custom_columns','activity_events'
  ]) loop
    -- Drop the old policy
    execute format('drop policy if exists "own rows" on public.%I;', t);
    
    -- Select policy (Owner + Collaborators can read)
    execute format($p$
      create policy "view rows" on public.%I for select using (
        user_id = auth.uid() or
        exists (select 1 from public.planner_collaborators pc where pc.planner_id = planner_id and pc.user_id = auth.uid())
      );
    $p$, t);
    
    -- Insert/Update/Delete policy (Owner + Editors can write)
    execute format($p$
      create policy "write rows" on public.%I for all using (
        user_id = auth.uid() or
        exists (select 1 from public.planner_collaborators pc where pc.planner_id = planner_id and pc.user_id = auth.uid() and pc.role = 'editor')
      ) with check (
        user_id = auth.uid() or
        exists (select 1 from public.planner_collaborators pc where pc.planner_id = planner_id and pc.user_id = auth.uid() and pc.role = 'editor')
      );
    $p$, t);

  end loop;
end $$;
