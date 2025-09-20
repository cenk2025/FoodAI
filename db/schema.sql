-- db/schema.sql (Supabase SQL editorine de uygulanabilir)
create extension if not exists pgcrypto;
create extension if not exists vector; -- ileride AI arama için

create table if not exists providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  website text,
  api_type text check (api_type in ('feed','api','scrape')) default 'api',
  status text default 'active'
);

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

create table if not exists clickouts (
  id bigserial primary key,
  offer_id uuid references offers(id) on delete set null,
  provider_id uuid references providers(id) on delete set null,
  user_id uuid, -- Supabase Auth uid (uuid string)
  ip inet,
  ua text,
  at timestamptz default now(),
  referer text
);

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

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  photo_url text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- FAVORITES
create table if not exists favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  offer_id uuid not null references offers(id) on delete cascade,
  added_at timestamptz default now(),
  primary key (user_id, offer_id)
);

-- ALERTS
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

-- Materialized view for fast listing
drop materialized view if exists offer_index;
create materialized view offer_index as
select o.id, o.title, o.discount_percent, o.discounted_price, o.city, o.tags,
       r.cuisine, r.lat, r.lon, o.ends_at, p.slug as provider_slug, o.image_url,
       o.inserted_at as created_at, o.pickup, o.delivery
from offers o
left join restaurants r on r.id = o.restaurant_id
left join providers p on p.id = o.provider_id
where o.status = 'active';
create index on offers (status, ends_at);
create index on offer_index (city, discount_percent desc, ends_at);

-- RLS
alter table providers enable row level security;
alter table restaurants enable row level security;
alter table offers enable row level security;
alter table clickouts enable row level security;
alter table commissions enable row level security;
alter table profiles enable row level security;

-- Public read on offers and providers/restaurants
create policy "public read providers" on providers for select using (true);
create policy "public read restaurants" on restaurants for select using (true);
create policy "public read offers" on offers for select using (status = 'active');

-- Clickouts insert by anon/auth (server will proxy, but safe to allow)
create policy "insert clickouts" on clickouts for insert
  with check (true);

-- Profiles: user can read/update self
create policy "read own profile" on profiles for select using (auth.uid() = id);
create policy "update own profile" on profiles for update using (auth.uid() = id);

-- FAVORITES RLS
alter table favorites enable row level security;
create policy "read own favs" on favorites for select using (auth.uid() = user_id);
create policy "insert own fav" on favorites for insert with check (auth.uid() = user_id);
create policy "delete own fav" on favorites for delete using (auth.uid() = user_id);

-- ALERTS RLS
alter table alerts enable row level security;
create policy "read own alerts" on alerts for select using (auth.uid() = user_id);
create policy "write own alerts" on alerts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Admin will use service role for writes/imports

-- RPC function to refresh materialized view
create or replace function refresh_materialized_view(view_name text)
returns void language plpgsql as $$
begin
  execute 'refresh materialized view ' || quote_ident(view_name);
end; $$;


-- Supabase Auth'ta Google sağlayıcısını açarsan, auth.users otomatik oluşur. 
-- profiles tablosuna Edge Function veya Webhook ile mirror ekleyeceğiz (aşağıda).