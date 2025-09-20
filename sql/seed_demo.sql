-- providers
insert into providers (name, slug, website) values
  ('Wolt','wolt','https://wolt.com'),
  ('Foodora','foodora','https://foodora.fi'),
  ('ResQ Club','resq','https://resq-club.com')
on conflict (slug) do update set website=excluded.website;

-- helper CTEs
with p as (
  select id, slug from providers where slug in ('wolt','foodora','resq')
)
insert into offers (provider_id, title, description, original_price, discounted_price, currency, pickup, delivery, city, deep_link, image_url, status)
select
  (select id from p where slug='wolt'),
  'Burger Menü', 'Mehukas burger + ranskalaiset', 12.90, 7.90, 'EUR', false, true, 'Jyväskylä',
  'https://example.com/wolt/burger',
  'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop',
  'active'
union all
select
  (select id from p where slug='foodora'),
  'Sushi Setti -30%', '8 kpl mix', 14.90, 10.43, 'EUR', true, true, 'Helsinki',
  'https://example.com/foodora/sushi',
  'https://images.unsplash.com/photo-1542736667-069246bdbc74?q=80&w=1200&auto=format&fit=crop',
  'active'
union all
select
  (select id from p where slug='resq'),
  'ResQ Lounasboksi', 'Ylijäämä lämmin ateria', 9.90, 4.90, 'EUR', true, false, 'Tampere',
  'https://example.com/resq/lunch',
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1200&auto=format&fit=crop',
  'active'
on conflict on constraint idx_offers_unique do nothing;

-- smoke test
select id, title, discounted_price, discount_percent, city from offers order by inserted_at desc limit 5;
select * from offer_index order by discount_percent desc limit 5;