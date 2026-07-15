create or replace function public.get_admin_users()
returns table (
  id uuid,
  display_name text,
  avatar_url text,
  theme text,
  date_format text,
  default_currency text,
  locale text,
  created_at timestamptz,
  updated_at timestamptz,
  email text
)
language plpgsql security definer
as $$
begin
  if (select auth.jwt() ->> 'email') != 'hasanalijaffe@gmail.com' then
    raise exception 'Unauthorized';
  end if;

  return query
  select 
    p.id,
    p.display_name,
    p.avatar_url,
    p.theme,
    p.date_format,
    p.default_currency,
    p.locale,
    p.created_at,
    p.updated_at,
    u.email::text as email
  from profiles p
  join auth.users u on p.id = u.id
  order by p.created_at desc;
end;
$$;
