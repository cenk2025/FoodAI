---
trigger: manual
---
# FoodAi (foodai.fi) – Build Rules

**Goal:** A trivago-like metasearch for **discounted food offers in Finland** (restaurants & delivery platforms). Aggregate deals from multiple providers, normalize, deduplicate, rank, and present them with **click-outs** (CPC/CPA style). Include a secure **admin** with commission/reconciliation, a **modern fast-food UI**, **DeepSeek-powered deal chatbot**, **Supabase DB**, **Firebase Auth + Google sign-in**, **i18n (FI default, EN optional)**, and **light/dark/system themes**.

---

## 0) Non-negotiables (Read every time you run)
- ✅ Use **TypeScript** + **Next.js (App Router, latest stable)** + **React Server Components** where sensible, **Edge** for read-only routes, **Node** for auth/admin.
- ✅ **Supabase** = primary DB & storage. Enforce **RLS**. Never expose service keys on client.
- ✅ **Auth via Firebase Auth** (Email/Password + Google). Mirror user profile in Supabase `profiles` via server webhook.
- ✅ **DeepSeek** for chatbot; **never** hardcode keys. Use server route handlers. RAG over our offers index.
- ✅ Default language **Finnish**; add **English** toggle. Use `next-intl` or `next-i18next`.
- ✅ **Design tokens** & themes via Tailwind + CSS variables. No inline magic values.
- ✅ **Right-side full-height drawer** = main hamburger menu. **Left persistent icon rail** (compact) = quick nav.
- ✅ **Cookie (biscuit) consent** with granular controls (analytics/ads strictly opt-in; functional default).
- ✅ **Clickout tracking**: server-side redirect `/go/:offerId` logs click, appends partner params/UTM, then 302.
- ✅ Respect source **TOS/robots.txt**. Use official APIs or partner feeds. Fallback scraping only if compliant and rate-limited.

---

## 1) Architecture Overview
- **Packages/Stack:** Next.js, Tailwind, shadcn/ui, Zustand (view state), Zod (validation), Prisma (optional) or direct Supabase client, Playwright (E2E), Vitest (unit), Pino (logging).
- **Layers:**
  - **Connectors** (server-only): Fetch from providers (e.g., Wolt, Foodora, ResQ Club, partner CSV/feeds). Normalize to `Offer`.
  - **Normalizer & Deduper:** Map to canonical schema; fuzzy match by restaurant, SKU, timing; collapse dupes.
  - **DealScore Engine:** Rank by % discount, final price, distance, delivery fee, rating, popularity, freshness.
  - **Indexer:** Materialized view `offer_index` for ultra-fast filters & search.
  - **Web:** Public UI, Search, Offer pages, Provider pages, City pages.
  - **Admin:** Providers, commissions, reconciliation, click analytics, manual offer editor, data-quality flags.
  - **AI:** DeepSeek chat endpoint + vector store from offers (title, tags, cuisine, location).

---

## 2) Monetization (Trivago-inspired)
- **CPC Clickouts:** Track clicks per provider; store bid/cost if available; compute revenue estimate.
- **CPA/Commission:** Per-conversion reports imported (manual CSV or webhook). Reconcile to click chains; show **pending → confirmed → canceled** states.
- **Display inventory:** Optional ad slots on home/category pages.
- **Admin dashboards:** revenue by provider, EPC (earnings per click), CTR, ROAS-like views.

> Reference patterns: trivago’s CPC base + CPA/commission programs & reconciliation UX.  
> Do **NOT** claim bookings; we are **meta** only; provider is merchant of record.

---

## 3) Data Sources & Compliance
- Prefer **official partner feeds/APIs**.
- If scraping is allowed:
  - Respect robots, rate-limit, rotate user-agents, cache results, and store `source_snapshot_url`.
  - Never bypass paywalls, captchas, or anti-bot in violation of TOS.
- Providers to target (FI): **Wolt, Foodora, ResQ Club** (+ opt-in from local chains). Build connectors as isolated modules with retry/backoff.

---

## 4) Supabase Schema (minimal v1)
```sql
-- core entities
create table providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  website text,
  api_type text check (api_type in ('feed','api','scrape')),
  status text default 'active'
);

create table restaurants (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references providers(id),
  external_id text, -- provider side
  name text not null,
  city text,
  lat double precision,
  lon double precision,
  cuisine text[],
  rating numeric(3,2),
  unique(provider_id, external_id)
);

create table offers (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references providers(id) not null,
  restaurant_id uuid references restaurants(id),
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
  deep_link text, -- clickout target
  image_url text,
  tags text[],
  status text default 'active',
  inserted_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- click tracking & monetization
create table clickouts (
  id bigserial primary key,
  offer_id uuid references offers(id),
  provider_id uuid references providers(id),
  user_id text, -- Firebase uid (string) optional
  ip inet,
  ua text,
  at timestamptz default now(),
  referer text
);

create table commissions (
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

-- profiles synced from Firebase
create table profiles (
  uid text primary key,
  email text,
  display_name text,
  photo_url text,
  created_at timestamptz default now()
);

-- materialized index for fast search
create materialized view offer_index as
select o.id, o.title, o.discount_percent, o.discounted_price, o.city, r.cuisine, r.lat, r.lon,
       o.tags, o.ends_at, p.slug as provider_slug
from offers o
left join restaurants r on r.id = o.restaurant_id
left join providers p on p.id = o.provider_id
where o.status = 'active';

create index on offers (provider_id, status, ends_at);
create index on offer_index (city, discount_percent desc, ends_at);
