-- 2A. Extensions + helper function + enums
create extension if not exists "pgcrypto";

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- 2B. profiles (1-to-1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  theme text not null default 'dark',
  date_format text not null default 'yyyy-MM-dd',
  default_currency text not null default 'USD',
  locale text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- 2C. planners (root scope for everything else)
create table public.planners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  emoji text not null default '📘',
  currency text not null default 'USD',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.planners to authenticated;
grant all on public.planners to service_role;
alter table public.planners enable row level security;
create policy "own planners" on public.planners
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index planners_user_idx on public.planners(user_id);
create trigger planners_touch before update on public.planners
  for each row execute function public.touch_updated_at();

-- 2D. Auto-seed profile + default planner on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'avatar_url');
  insert into public.planners (user_id, name, is_default) values (new.id, 'Personal', true);
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2E. Reusable table pattern

-- ACCOUNTS
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  planner_id uuid not null references public.planners(id) on delete cascade,
  name text not null,
  kind text not null default 'bank',
  currency text not null default 'USD',
  balance numeric not null default 0,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- CLIENTS
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  planner_id uuid not null references public.planners(id) on delete cascade,
  name text not null,
  email text, phone text, company text, website text, address text, notes text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- PROJECTS
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  planner_id uuid not null references public.planners(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  name text not null,
  description text,
  status text not null default 'active',
  value numeric,
  currency text not null default 'USD',
  deadline date,
  progress int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- INVOICES
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  planner_id uuid not null references public.planners(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  invoice_number text not null,
  amount numeric not null default 0,
  tax numeric not null default 0,
  currency text not null default 'USD',
  status text not null default 'pending',
  issue_date date not null default current_date,
  due_date date,
  paid_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- EXPENSE CATEGORIES
create table public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  planner_id uuid not null references public.planners(id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz not null default now()
);

-- INCOME ENTRIES
create table public.income_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  planner_id uuid not null references public.planners(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  invoice_id uuid references public.invoices(id) on delete set null,
  date date not null default current_date,
  amount numeric not null default 0,
  currency text not null default 'USD',
  description text,
  source text,
  status text not null default 'pending',
  tags text[],
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- EXPENSE ENTRIES
create table public.expense_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  planner_id uuid not null references public.planners(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete set null,
  category_id uuid references public.expense_categories(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  date date not null default current_date,
  amount numeric not null default 0,
  currency text not null default 'USD',
  description text,
  vendor text,
  payment_method text,
  tags text[],
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- TRANSFERS
create table public.transfers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  planner_id uuid not null references public.planners(id) on delete cascade,
  from_account_id uuid references public.accounts(id) on delete set null,
  to_account_id uuid references public.accounts(id) on delete set null,
  amount numeric not null default 0,
  currency text not null default 'USD',
  date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

-- INVESTMENTS
create table public.investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  planner_id uuid not null references public.planners(id) on delete cascade,
  name text not null default 'New investment',
  kind text not null default 'stock',
  symbol text,
  allocated_amount numeric not null default 0,
  current_value numeric not null default 0,
  return_amount numeric not null default 0,
  currency text not null default 'USD',
  notes text,
  purchase_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- GOALS
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  planner_id uuid not null references public.planners(id) on delete cascade,
  name text not null,
  description text,
  target_amount numeric not null default 0,
  saved_amount numeric not null default 0,
  currency text not null default 'USD',
  target_date date,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- BUDGETS
create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  planner_id uuid not null references public.planners(id) on delete cascade,
  category_id uuid references public.expense_categories(id) on delete set null,
  month date not null,
  amount numeric not null default 0,
  currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- NOTES
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  planner_id uuid not null references public.planners(id) on delete cascade,
  title text not null default 'Untitled',
  content text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- DOC FOLDERS + DOCUMENTS
create table public.doc_folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  planner_id uuid not null references public.planners(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  planner_id uuid not null references public.planners(id) on delete cascade,
  folder_id uuid references public.doc_folders(id) on delete set null,
  file_name text not null,
  file_path text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

-- PAYMENT PROOFS + RECEIPTS
create table public.payment_proofs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  planner_id uuid not null references public.planners(id) on delete cascade,
  invoice_id uuid references public.invoices(id) on delete set null,
  income_entry_id uuid references public.income_entries(id) on delete set null,
  file_name text not null, file_path text not null, mime_type text, size_bytes bigint,
  amount numeric, currency text, notes text,
  created_at timestamptz not null default now()
);
create table public.receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  planner_id uuid not null references public.planners(id) on delete cascade,
  expense_entry_id uuid references public.expense_entries(id) on delete set null,
  file_name text not null, file_path text not null, mime_type text, size_bytes bigint,
  created_at timestamptz not null default now()
);

-- CUSTOM COLUMNS
create table public.custom_columns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  planner_id uuid not null references public.planners(id) on delete cascade,
  table_name text not null,
  column_key text not null,
  label text not null,
  kind text not null default 'text',
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- ACTIVITY EVENTS
create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  planner_id uuid not null references public.planners(id) on delete cascade,
  kind text not null,
  title text not null,
  subtitle text,
  ref_table text,
  ref_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- 2F. Grants + RLS for all of the above
do $$
declare t text;
begin
  for t in select unnest(array[
    'accounts','clients','projects','invoices','expense_categories',
    'income_entries','expense_entries','transfers','investments','goals',
    'budgets','notes','doc_folders','documents','payment_proofs','receipts',
    'custom_columns','activity_events'
  ]) loop
    execute format('grant select,insert,update,delete on public.%I to authenticated;', t);
    execute format('grant all on public.%I to service_role;', t);
    execute format('alter table public.%I enable row level security;', t);
    execute format($p$create policy "own rows" on public.%I for all using (auth.uid() = user_id) with check (auth.uid() = user_id);$p$, t);
    -- updated_at trigger where the column exists
    if exists (select 1 from information_schema.columns where table_schema='public' and table_name=t and column_name='updated_at') then
      execute format('create trigger %I_touch before update on public.%I for each row execute function public.touch_updated_at();', t, t);
    end if;
  end loop;
end $$;

-- helpful indexes
create index income_planner_date_idx on public.income_entries(planner_id, date desc);
create index expense_planner_date_idx on public.expense_entries(planner_id, date desc);
create index invoices_planner_idx on public.invoices(planner_id);
create index investments_planner_idx on public.investments(planner_id);

-- 3. Storage bucket (Document Vault)
-- NOTE: The bucket 'planner-files' needs to be created in the Supabase UI first (Storage -> New bucket).
-- After creating the bucket, these policies will apply.

create policy "users read own files" on storage.objects
  for select to authenticated
  using (bucket_id = 'planner-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users write own files" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'planner-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users update own files" on storage.objects
  for update to authenticated
  using (bucket_id = 'planner-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users delete own files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'planner-files' and (storage.foldername(name))[1] = auth.uid()::text);
