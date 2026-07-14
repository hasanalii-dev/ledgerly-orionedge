-- Drop the old constraint
alter table public.bug_reports 
  drop constraint if exists bug_reports_user_id_fkey;

-- Add the new constraint pointing to profiles
alter table public.bug_reports 
  add constraint bug_reports_user_id_fkey 
  foreign key (user_id) references public.profiles(id) on delete set null;
