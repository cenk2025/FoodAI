// Platform-wide knobs for direct-order economics. Centralised so we can
// adjust pricing and commissions without sweeping the codebase.

/**
 * Flat delivery fee charged at checkout. FoodAi dispatches every direct
 * order through Uber Eats logistics, so the fee is uniform regardless of
 * restaurant. The per-zone `fee_cents` column is no longer consulted at
 * checkout — kept for historic / admin-visibility purposes only.
 */
export const UBER_EATS_DELIVERY_FEE_CENTS = 575;

/**
 * Default commission rate FoodAi charges restaurants per order. Stored in
 * basis points (1 bps = 0.01 %), so 1000 = 10 %. The value at order time is
 * snapshotted into `direct_orders.commission_rate_bps` so historical orders
 * survive future rate changes.
 */
export const DEFAULT_COMMISSION_RATE_BPS = 1000;

/**
 * Resolve the commission amount for a given subtotal. Commission is taken
 * on the food subtotal only — the Uber Eats delivery fee passes through to
 * the courier, so it never enters FoodAi's share.
 */
export function computeCommissionCents(
    subtotalCents: number,
    rateBps: number = DEFAULT_COMMISSION_RATE_BPS,
): number {
    return Math.round((subtotalCents * rateBps) / 10_000);
}
