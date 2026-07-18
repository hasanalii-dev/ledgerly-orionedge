alter table public.monthly_allocations add column if not exists is_completed boolean not null default false;
