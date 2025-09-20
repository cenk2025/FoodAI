alter table offers
  add column if not exists search_tsv tsvector
  generated always as (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,''))) stored;

create index if not exists idx_offers_search_tsv on offers using gin (search_tsv);