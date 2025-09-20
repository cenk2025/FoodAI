create unique index if not exists idx_offers_unique
on offers(provider_id, title, discounted_price, coalesce(deep_link,''));