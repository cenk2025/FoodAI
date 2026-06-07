-- FoodAi — Commission tracking for direct orders
-- Adds commission_rate_bps (basis points, 1000 = 10 %) and commission_cents
-- (the snapshotted euro-cent amount FoodAi earns on the order) to
-- direct_orders. Both are stored at order-creation time so historical orders
-- survive any future rate changes.
--
-- The values are defaulted on existing rows so the columns can be NOT NULL.

ALTER TABLE direct_orders
    ADD COLUMN IF NOT EXISTS commission_rate_bps INT NOT NULL DEFAULT 1000
        CHECK (commission_rate_bps >= 0),
    ADD COLUMN IF NOT EXISTS commission_cents INT NOT NULL DEFAULT 0
        CHECK (commission_cents >= 0);

-- Backfill any rows that pre-date the column at the current default rate.
UPDATE direct_orders
SET commission_cents = ROUND(subtotal_cents * commission_rate_bps / 10000.0)::INT
WHERE commission_cents = 0 AND subtotal_cents > 0;

-- Reporting index — admin commission rollups filter by restaurant + time.
CREATE INDEX IF NOT EXISTS idx_direct_orders_restaurant_time
    ON direct_orders(restaurant_id, created_at DESC);
