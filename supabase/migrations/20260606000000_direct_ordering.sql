-- FoodAi — Direct Restaurant Ordering
-- Additive migration: introduces tables for restaurants that sell directly
-- through FoodAi. Coexists with the existing aggregator schema
-- (cities, sources, restaurants, meals, offers) and does NOT modify it.

-- Direct-sale restaurants (own menus, own owners, own orders)
CREATE TABLE direct_restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
    address TEXT,
    lat NUMERIC(9,6),
    lon NUMERIC(9,6),
    logo_url TEXT,
    cover_url TEXT,
    rating NUMERIC(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    eta_min INT,
    eta_max INT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu items the restaurant sells directly (price lives here, unlike `meals`)
-- sizes / customization_groups are stored as JSONB so the schema stays flat
-- while the per-item structure (radio groups, multi-select toppings, free
-- quantity, …) can evolve without migrations.
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES direct_restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price_cents INT NOT NULL CHECK (price_cents >= 0),
    currency TEXT DEFAULT 'EUR',
    image_url TEXT,
    category TEXT,
    is_available BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    sizes JSONB DEFAULT '[]'::jsonb,
    customization_groups JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Per-restaurant delivery zone (simple circular stub; replace with polygon later)
CREATE TABLE delivery_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES direct_restaurants(id) ON DELETE CASCADE,
    center_lat NUMERIC(9,6) NOT NULL,
    center_lon NUMERIC(9,6) NOT NULL,
    radius_m INT NOT NULL CHECK (radius_m > 0),
    fee_cents INT DEFAULT 0 CHECK (fee_cents >= 0),
    min_order_cents INT DEFAULT 0 CHECK (min_order_cents >= 0),
    allowed_postal_codes TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer orders placed through FoodAi (direct flow)
CREATE TABLE direct_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES direct_restaurants(id) ON DELETE RESTRICT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    customer_email TEXT,
    delivery_address TEXT NOT NULL,
    delivery_postal_code TEXT,
    delivery_lat NUMERIC(9,6),
    delivery_lon NUMERIC(9,6),
    notes TEXT,
    subtotal_cents INT NOT NULL CHECK (subtotal_cents >= 0),
    delivery_fee_cents INT DEFAULT 0 CHECK (delivery_fee_cents >= 0),
    total_cents INT NOT NULL CHECK (total_cents >= 0),
    currency TEXT DEFAULT 'EUR',
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','paid','preparing','ready','in_delivery','delivered','cancelled')),
    payment_status TEXT NOT NULL DEFAULT 'unpaid'
        CHECK (payment_status IN ('unpaid','pending','paid','failed','refunded')),
    payment_provider TEXT,
    payment_reference TEXT,
    delivery_provider TEXT,
    delivery_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Line items snapshot — preserves the price/name at order time even if menu changes later
-- size_snapshot: { id, label, priceCents } | null
-- options_snapshot: array of { groupId, groupLabel, optionId, optionLabel, priceCents }
-- unit_price_cents_snapshot is the resolved per-unit price (base + size + options).
CREATE TABLE direct_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES direct_orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    name_snapshot TEXT NOT NULL,
    size_snapshot JSONB,
    options_snapshot JSONB DEFAULT '[]'::jsonb,
    unit_price_cents_snapshot INT NOT NULL CHECK (unit_price_cents_snapshot >= 0),
    quantity INT NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_direct_restaurants_slug ON direct_restaurants(slug);
CREATE INDEX idx_direct_restaurants_city ON direct_restaurants(city_id) WHERE is_active = true;
CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id) WHERE is_available = true;
CREATE INDEX idx_menu_items_sort ON menu_items(restaurant_id, sort_order);
CREATE INDEX idx_delivery_zones_restaurant ON delivery_zones(restaurant_id);
CREATE INDEX idx_direct_orders_restaurant ON direct_orders(restaurant_id, created_at DESC);
CREATE INDEX idx_direct_orders_status ON direct_orders(status);
CREATE INDEX idx_direct_order_items_order ON direct_order_items(order_id);

-- Row Level Security
ALTER TABLE direct_restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_order_items ENABLE ROW LEVEL SECURITY;

-- Public read for active restaurants, available menu items, and their delivery zones
CREATE POLICY "Public can read active direct restaurants" ON direct_restaurants
    FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read available menu items" ON menu_items
    FOR SELECT USING (is_available = true);
CREATE POLICY "Public can read delivery zones" ON delivery_zones
    FOR SELECT USING (true);

-- Orders: written through server actions with the service role; no public read
-- (later: add per-customer read once auth is wired)

-- Admin write (same JWT-role pattern as the existing schema)
CREATE POLICY "Admins manage direct restaurants" ON direct_restaurants FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins manage menu items" ON menu_items FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins manage delivery zones" ON delivery_zones FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins manage direct orders" ON direct_orders FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins manage direct order items" ON direct_order_items FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Seed: PizzaPizza demo restaurant in Jyväskylä
-- Jyväskylä center: 62.2426, 25.7473
INSERT INTO cities (name, country_code)
VALUES ('Jyväskylä', 'FI')
ON CONFLICT (name) DO NOTHING;

INSERT INTO direct_restaurants
    (slug, name, description, city_id, address, lat, lon, logo_url, cover_url, rating, eta_min, eta_max)
VALUES (
    'pizzapizza',
    'PizzaPizza',
    'Käsintehtyjä napolilaisia pizzoja Jyväskylän sydämessä.',
    (SELECT id FROM cities WHERE name = 'Jyväskylä' LIMIT 1),
    'Kauppakatu 25, 40100 Jyväskylä',
    62.2426,
    25.7473,
    '/images/pizzapizza-logo.svg',
    '/images/pizza.jpg',
    4.7,
    25,
    40
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO delivery_zones
    (restaurant_id, center_lat, center_lon, radius_m, fee_cents, min_order_cents, allowed_postal_codes)
SELECT id, 62.2426, 25.7473, 5000, 290, 1500, ARRAY['40100','40200','40320','40400','40500','40520','40600','40700','40720']
FROM direct_restaurants WHERE slug = 'pizzapizza'
ON CONFLICT DO NOTHING;

-- Helper expression: two-size variant for a given base price, expressed as JSONB.
-- ("Normaali 32cm" at base price, "Perhepizza 40cm" at +5,00 €.)
INSERT INTO menu_items
    (restaurant_id, name, description, price_cents, image_url, category, sort_order, sizes, customization_groups)
SELECT
    r.id,
    x.name,
    x.description,
    x.price_cents,
    x.image_url,
    x.category,
    x.sort_order,
    jsonb_build_array(
        jsonb_build_object('id', 'sz-normaali', 'label', 'Normaali (32 cm)',  'priceCents', x.price_cents),
        jsonb_build_object('id', 'sz-perhe',    'label', 'Perhepizza (40 cm)', 'priceCents', x.price_cents + 500)
    ) AS sizes,
    x.customization_groups
FROM direct_restaurants r
CROSS JOIN (VALUES
    ('Margherita',      'Klassikko: San Marzano -tomaattikastike, fior di latte -mozzarella, tuore basilika, oliiviöljy.', 1190, '/images/pizza.jpg', 'Pizza', 1, '[]'::jsonb),
    ('Diavola',         'Tulinen salami, mozzarella, tomaattikastike, ripaus chiliöljyä.',                                 1390, '/images/pizza.jpg', 'Pizza', 2, '[]'::jsonb),
    ('Quattro Formaggi','Neljä juustoa: mozzarella, gorgonzola, parmesan, savustettu provola.',                            1490, '/images/pizza.jpg', 'Pizza', 3, '[]'::jsonb),
    ('Oma valinta',     'Rakenna oma pizzasi: valitse pohja ja täytteet. Vähintään 2 täytettä, ensimmäiset 4 ovat ilmaisia.', 1300, '/images/pizza.jpg', 'Pizza', 4,
        jsonb_build_array(
            jsonb_build_object(
                'id', 'grp-pohja',
                'label', 'Valitse pohja',
                'type', 'single',
                'minSelect', 1,
                'maxSelect', 1,
                'options', jsonb_build_array(
                    jsonb_build_object('id', 'pohja-normaali',    'label', 'Normaali',    'priceCents', 0),
                    jsonb_build_object('id', 'pohja-ruis',        'label', 'Ruispizza',   'priceCents', 100),
                    jsonb_build_object('id', 'pohja-gluteeniton', 'label', 'Gluteeniton', 'priceCents', 100),
                    jsonb_build_object('id', 'pohja-pannu',       'label', 'Pannupizza',  'priceCents', 200)
                )
            ),
            jsonb_build_object(
                'id', 'grp-taytteet',
                'label', 'Lisätäytteet',
                'type', 'multi',
                'minSelect', 2,
                'freeQuantity', 4,
                'helperText', 'Valitse vähintään 2 kpl · Ensimmäiset 4 ovat ilmaisia',
                'options', jsonb_build_array(
                    jsonb_build_object('id', 'top-jauheliha',     'label', 'Jauheliha',     'priceCents', 150),
                    jsonb_build_object('id', 'top-kebabliha',     'label', 'Kebabliha',     'priceCents', 150),
                    jsonb_build_object('id', 'top-kanadoner',     'label', 'Kanadöner',     'priceCents', 150),
                    jsonb_build_object('id', 'top-kinkku',        'label', 'Kinkku',        'priceCents', 150),
                    jsonb_build_object('id', 'top-salamimakkara', 'label', 'Salamimakkara', 'priceCents', 150),
                    jsonb_build_object('id', 'top-pekoni',        'label', 'Pekoni',        'priceCents', 150),
                    jsonb_build_object('id', 'top-kana',          'label', 'Kana',          'priceCents', 150),
                    jsonb_build_object('id', 'top-tonnikala',     'label', 'Tonnikala',     'priceCents', 150),
                    jsonb_build_object('id', 'top-katkarapu',     'label', 'Katkarapu',     'priceCents', 150),
                    jsonb_build_object('id', 'top-sienet',        'label', 'Sienet',        'priceCents', 150),
                    jsonb_build_object('id', 'top-ananas',        'label', 'Ananas',        'priceCents', 150),
                    jsonb_build_object('id', 'top-aurajuusto',    'label', 'Aurajuusto',    'priceCents', 150),
                    jsonb_build_object('id', 'top-paprika',       'label', 'Paprika',       'priceCents', 150),
                    jsonb_build_object('id', 'top-jalapeno',      'label', 'Jalapeño',      'priceCents', 150)
                )
            )
        )
    )
) AS x(name, description, price_cents, image_url, category, sort_order, customization_groups)
WHERE r.slug = 'pizzapizza'
ON CONFLICT DO NOTHING;
