create table if not exists favorites (
  user_id uuid not null,
  offer_id uuid not null references offers(id) on delete cascade,
  added_at timestamptz default now(),
  primary key (user_id, offer_id)
);
alter table favorites enable row level security;

create policy "read own favs" on favorites for select using (auth.uid() = user_id);
create policy "insert own fav" on favorites for insert with check (auth.uid() = user_id);
create policy "delete own fav" on favorites for delete using (auth.uid() = user_id);