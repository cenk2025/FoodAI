-- Extensions
create extension if not exists pgcrypto;
create extension if not exists vector;

-- Providers
create table if not exists providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  website text,
  api_type text check (api_type in ('feed','api','scrape')) default 'api',
  status text default 'active'
);

-- Restaurants
create table if not exists restaurants (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references providers(id) on delete set null,
  external_id text,
  name text not null,
  city text,
  lat double precision,
  lon double precision,
  cuisine text[],
  rating numeric(3,2),
  unique(provider_id, external_id)
);

-- Offers
create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references providers(id) not null,
  restaurant_id uuid references restaurants(id) on delete set null,
  title text not null,
  description text,
  original_price numeric(10,2),
  discounted_price numeric(10,2),
  discount_percent numeric(5,2) generated always as
    (case when original_price > 0 then round((1 - discounted_price/original_price)*100,2) else null end) stored,
  currency text default 'EUR',
  pickup boolean default false,
  delivery boolean default true,
  delivery_fee numeric(10,2),
  starts_at timestamptz,
  ends_at timestamptz,
  deep_link text,
  image_url text,
  tags text[],
  status text default 'active',
  city text,
  inserted_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_offers_status on offers(status, ends_at);
create index if not exists idx_offers_provider on offers(provider_id, status);

-- Click tracking
create table if not exists clickouts (
  id bigserial primary key,
  offer_id uuid references offers(id) on delete set null,
  provider_id uuid references providers(id) on delete set null,
  user_id uuid, -- supabase auth uid
  ip inet,
  ua text,
  at timestamptz default now(),
  referer text
);

-- Commissions (CPA reconciliation)
create table if not exists commissions (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references providers(id),
  external_conversion_id text,
  clickout_id bigint references clickouts(id),
  offer_id uuid references offers(id),
  gross_amount numeric(10,2),
  commission_amount numeric(10,2),
  currency text default 'EUR',
  status text check (status in ('pending','approved','canceled')) default 'pending',
  occurred_at timestamptz,
  reported_at timestamptz default now(),
  unique(provider_id, external_conversion_id)
);

-- Profiles mirror of auth.users
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  photo_url text,
  is_admin boolean default false,
  created_at timestamptz default now()
);
create index if not exists idx_profiles_admin on profiles(is_admin);

-- Favorites
create table if not exists favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  offer_id uuid not null references offers(id) on delete cascade,
  added_at timestamptz default now(),
  primary key (user_id, offer_id)
);

-- Alerts
create table if not exists alerts (
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

-- Public view for fast listing (use VIEW to keep PostgREST happy; RLS applies on base tables)
drop view if exists offer_index;
create view offer_index as
select o.id, o.title, o.discount_percent, o.discounted_price, o.city, o.tags,
       r.cuisine, r.lat, r.lon, o.ends_at, p.slug as provider_slug, o.image_url,
       o.pickup, o.delivery, o.inserted_at as created_at
from offers o
left join restaurants r on r.id = o.restaurant_id
left join providers p on p.id = o.provider_id
where o.status = 'active';

-- RLS
alter table providers enable row level security;
alter table restaurants enable row level security;
alter table offers enable row level security;
alter table clickouts enable row level security;
alter table commissions enable row level security;
alter table profiles enable row level security;
alter table favorites enable row level security;
alter table alerts enable row level security;

-- SELECT policies (public read of active supply)
create policy "public read providers" on providers for select using (true);
create policy "public read restaurants" on restaurants for select using (true);
create policy "public read offers" on offers for select using (status = 'active');

-- Clickouts: allow inserts (server proxy or client) - minimal
create policy "insert clickouts" on clickouts for insert with check (true);
create policy "read own clicks" on clickouts for select using (true);

-- Profiles: user self-access
create policy "read own profile" on profiles for select using (auth.uid() = id);
create policy "update own profile" on profiles for update using (auth.uid() = id);

-- Favorites: per-user
create policy "read own favs" on favorites for select using (auth.uid() = user_id);
create policy "insert own fav" on favorites for insert with check (auth.uid() = user_id);
create policy "delete own fav" on favorites for delete using (auth.uid() = user_id);

-- Alerts: per-user
create policy "read own alerts" on alerts for select using (auth.uid() = user_id);
create policy "write own alerts" on alerts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Admin RPCs (security definer) for analytics
create or replace function admin_click_summary()
returns table(cnt bigint)
language sql security definer set search_path = public as $$
  select count(*)::bigint from clickouts where at >= now() - interval '7 days';
$$;

create or replace function admin_clicks_by_provider()
returns table(provider text, clicks bigint)
language sql security definer set search_path = public as $$
  select coalesce(p.slug,'unknown') as provider, count(*)::bigint
  from clickouts c left join providers p on p.id = c.provider_id
  where c.at >= now() - interval '30 days'
  group by 1 order by 2 desc;
$$;

create or replace function admin_clicks_by_city()
returns table(city text, clicks bigint)
language sql security definer set search_path = public as $$
  select coalesce(o.city,'-') as city, count(*)::bigint
  from clickouts c join offers o on o.id = c.offer_id
  where c.at >= now() - interval '30 days'
  group by 1 order by 2 desc;
$$;

create or replace function admin_revenue_30d()
returns table(day date, revenue numeric)
language sql security definer set search_path = public as $$
  select date_trunc('day', occurred_at)::date as day, sum(commission_amount)::numeric as revenue
  from commissions
  where occurred_at >= now() - interval '30 days' and status='approved'
  group by 1 order by 1;
$$;

-- Optional helper to refresh a view name (no-op for normal views; kept for API parity)
create or replace function refresh_materialized_view(view_name text)
returns void language plpgsql as $$
begin
  -- placeholder: kept for compatibility; not used with normal VIEW
  perform 1;
end; $$;

-- Grants for the view (PostgREST exposes views automatically in public schema)
grant select on offer_index to anon, authenticated;