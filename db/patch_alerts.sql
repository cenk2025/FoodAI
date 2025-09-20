create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  city text,
  cuisine text[],
  discount_min numeric,
  price_max numeric,
  pickup boolean,
  delivery boolean,
  active boolean default true,
  created_at timestamptz default now()
);
alter table alerts enable row level security;

create policy "read own alerts" on alerts for select using (auth.uid() = user_id);
create policy "write own alerts" on alerts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);