-- Fix Infinite Recursion in RLS Policies

-- 1. Create secure functions that bypass RLS to check permissions
create or replace function public.is_planner_owner(p_id uuid)
returns boolean language sql security definer set search_path = public as $$
  select exists(select 1 from planners where id = p_id and user_id = auth.uid());
$$;

create or replace function public.is_planner_collaborator(p_id uuid)
returns boolean language sql security definer set search_path = public as $$
  select exists(select 1 from planner_collaborators where planner_id = p_id and user_id = auth.uid());
$$;

create or replace function public.is_planner_editor(p_id uuid)
returns boolean language sql security definer set search_path = public as $$
  select exists(select 1 from planner_collaborators where planner_id = p_id and user_id = auth.uid() and role = 'editor');
$$;

-- 2. Drop all recursive policies
drop policy if exists "view collaborators" on public.planner_collaborators;
drop policy if exists "manage collaborators" on public.planner_collaborators;

drop policy if exists "view planners" on public.planners;
drop policy if exists "update planners" on public.planners;

-- 3. Re-create safe policies using the functions
create policy "view planners" on public.planners
  for select using (
    user_id = auth.uid() or public.is_planner_collaborator(id)
  );

create policy "update planners" on public.planners
  for update using (
    user_id = auth.uid() or public.is_planner_editor(id)
  ) with check (
    user_id = auth.uid() or public.is_planner_editor(id)
  );

create policy "view collaborators" on public.planner_collaborators
  for select using (
    user_id = auth.uid() or 
    public.is_planner_owner(planner_id) or
    public.is_planner_collaborator(planner_id)
  );

create policy "manage collaborators" on public.planner_collaborators
  for all using (
    public.is_planner_owner(planner_id)
  ) with check (
    public.is_planner_owner(planner_id)
  );
