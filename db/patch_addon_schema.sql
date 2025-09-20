-- CLICKOUTS (CPC logging)
create table if not exists public.clickouts (
  id bigserial primary key,
  offer_id uuid references public.offers(id) on delete set null,
  provider_id uuid references public.providers(id) on delete set null,
  user_id uuid, -- supabase auth uid
  ip inet,
  ua text,
  at timestamptz default now(),
  referer text
);
alter table public.clickouts enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where policyname='insert clickouts') then
    create policy "insert clickouts" on public.clickouts for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname='read clickouts any') then
    create policy "read clickouts any" on public.clickouts for select using (true);
  end if;
end $$;

-- COMMISSIONS (CPA reconciliation)
create table if not exists public.commissions (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references public.providers(id),
  external_conversion_id text,
  clickout_id bigint references public.clickouts(id),
  offer_id uuid references public.offers(id),
  gross_amount numeric(10,2),
  commission_amount numeric(10,2),
  currency text default 'EUR',
  status text check (status in ('pending','approved','canceled')) default 'pending',
  occurred_at timestamptz,
  reported_at timestamptz default now(),
  unique(provider_id, external_conversion_id)
);
alter table public.commissions enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where policyname='read commissions any') then
    create policy "read commissions any" on public.commissions for select using (true);
  end if;
end $$;

-- PROFILES (mirror of auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  photo_url text,
  is_admin boolean default false,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where policyname='read own profile') then
    create policy "read own profile" on public.profiles for select using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where policyname='update own profile') then
    create policy "update own profile" on public.profiles for update using (auth.uid() = id);
  end if;
end $$;

-- FAVORITES
create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  offer_id uuid not null references public.offers(id) on delete cascade,
  added_at timestamptz default now(),
  primary key (user_id, offer_id)
);
alter table public.favorites enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where policyname='read own favs') then
    create policy "read own favs" on public.favorites for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname='insert own fav') then
    create policy "insert own fav" on public.favorites for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname='delete own fav') then
    create policy "delete own fav" on public.favorites for delete using (auth.uid() = user_id);
  end if;
end $$;

-- ALERTS
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  city text,
  cuisine text[],
  discount_min numeric,
  price_max numeric,
  pickup boolean,
  delivery boolean,
  active boolean default true,
  created_at timestamptz default now()
);
alter table public.alerts enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where policyname='read own alerts') then
    create policy "read own alerts" on public.alerts for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname='write own alerts') then
    create policy "write own alerts" on public.alerts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

-- Admin analytics RPCs (security definer)
create or replace function public.admin_click_summary()
returns table(cnt bigint)
language sql security definer set search_path=public as $$
  select count(*)::bigint from clickouts where at >= now() - interval '7 days';
$$;

create or replace function public.admin_clicks_by_provider()
returns table(provider text, clicks bigint)
language sql security definer set search_path=public as $$
  select coalesce(p.slug,'unknown') as provider, count(*)::bigint
  from clickouts c left join providers p on p.id = c.provider_id
  where c.at >= now() - interval '30 days'
  group by 1 order by 2 desc;
$$;

create or replace function public.admin_clicks_by_city()
returns table(city text, clicks bigint)
language sql security definer set search_path=public as $$
  select coalesce(o.city,'-') as city, count(*)::bigint
  from clickouts c join offers o on o.id = c.offer_id
  where c.at >= now() - interval '30 days'
  group by 1 order by 2 desc;
$$;

create or replace function public.admin_revenue_30d()
returns table(day date, revenue numeric)
language sql security definer set search_path=public as $$
  select date_trunc('day', occurred_at)::date as day, sum(commission_amount)::numeric as revenue
  from commissions
  where occurred_at >= now() - interval '30 days' and status='approved'
  group by 1 order by 1;
$$;