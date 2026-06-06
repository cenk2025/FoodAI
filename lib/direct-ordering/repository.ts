import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import * as mem from './memory-store';
import type {
    DirectRestaurant,
    MenuItem,
    DeliveryZone,
    Order,
    OrderItem,
} from './types';

// Repository facade: tries Supabase first; if env is missing or any call fails,
// transparently falls back to the in-memory store. Lets the rest of the app
// stay agnostic to whether the DB is wired up yet.

function isSupabaseConfigured(): boolean {
    return Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}

// Service-role client is used for the admin-gated write paths (menu CRUD,
// order create/update). RLS would otherwise block these because our admin
// auth is cookie-based, not a Supabase JWT. The cookie middleware at
// /admin/* enforces the trust boundary — Supabase's RLS isn't the gate.
function hasServiceRole(): boolean {
    return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// --- restaurants -----------------------------------------------------------

export async function listRestaurants(): Promise<DirectRestaurant[]> {
    if (!isSupabaseConfigured()) return mem.mem_listRestaurants();
    try {
        const sb = await createClient();
        if (!sb) return mem.mem_listRestaurants();
        const { data, error } = await sb
            .from('direct_restaurants')
            .select('*')
            .eq('is_active', true);
        if (error || !data) return mem.mem_listRestaurants();
        return data.map(rowToRestaurant);
    } catch {
        return mem.mem_listRestaurants();
    }
}

export async function getRestaurantBySlug(slug: string): Promise<DirectRestaurant | null> {
    if (!isSupabaseConfigured()) return mem.mem_getRestaurantBySlug(slug);
    try {
        const sb = await createClient();
        if (!sb) return mem.mem_getRestaurantBySlug(slug);
        const { data, error } = await sb
            .from('direct_restaurants')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();
        if (error || !data) return mem.mem_getRestaurantBySlug(slug);
        return rowToRestaurant(data);
    } catch {
        return mem.mem_getRestaurantBySlug(slug);
    }
}

export async function getRestaurantById(id: string): Promise<DirectRestaurant | null> {
    if (!isSupabaseConfigured()) return mem.mem_getRestaurantById(id);
    try {
        const sb = await createClient();
        if (!sb) return mem.mem_getRestaurantById(id);
        const { data, error } = await sb
            .from('direct_restaurants')
            .select('*')
            .eq('id', id)
            .maybeSingle();
        if (error || !data) return mem.mem_getRestaurantById(id);
        return rowToRestaurant(data);
    } catch {
        return mem.mem_getRestaurantById(id);
    }
}

export type UpsertRestaurantInput = Omit<DirectRestaurant, 'id' | 'city'> & {
    id?: string;
    cityName?: string;          // resolved to city_id in the join
};

export type UpsertRestaurantResult =
    | { ok: true; restaurant: DirectRestaurant }
    | { ok: false; error: 'duplicate_slug' | 'write_failed' };

export async function upsertRestaurant(
    input: UpsertRestaurantInput,
): Promise<UpsertRestaurantResult> {
    if (!(isSupabaseConfigured() && hasServiceRole())) {
        // In-memory fallback (best-effort — no slug uniqueness check beyond
        // what the store enforces).
        const r = mem.mem_upsertRestaurant({ ...input, id: input.id });
        return { ok: true, restaurant: r };
    }

    try {
        const sb = createServiceClient();

        // Resolve city_id from cityName (insert the city if it doesn't exist
        // yet — matches the seed migration's pattern).
        let cityId: string | null = null;
        const cityName = input.cityName?.trim() || input.city?.trim() || null;
        if (cityName) {
            const existing = await sb
                .from('cities')
                .select('id')
                .eq('name', cityName)
                .maybeSingle();
            if (existing.data?.id) {
                cityId = existing.data.id;
            } else {
                const created = await sb
                    .from('cities')
                    .insert({ name: cityName, country_code: 'FI' })
                    .select('id')
                    .single();
                cityId = created.data?.id ?? null;
            }
        }

        const row: Record<string, unknown> = {
            slug: input.slug,
            name: input.name,
            description: input.description || null,
            city_id: cityId,
            address: input.address || null,
            lat: input.lat,
            lon: input.lon,
            logo_url: input.logoUrl || null,
            cover_url: input.coverUrl || null,
            rating: input.rating,
            eta_min: input.etaMin,
            eta_max: input.etaMax,
            is_active: input.isActive,
            updated_at: new Date().toISOString(),
        };

        const query = input.id
            ? sb.from('direct_restaurants').update(row).eq('id', input.id).select().single()
            : sb.from('direct_restaurants').insert(row).select().single();
        const { data, error } = await query;

        if (error) {
            // Postgres unique-violation code is 23505
            if ((error as { code?: string }).code === '23505') {
                return { ok: false, error: 'duplicate_slug' };
            }
            console.warn('[direct-ordering] direct_restaurants upsert failed', error);
            return { ok: false, error: 'write_failed' };
        }
        if (!data) return { ok: false, error: 'write_failed' };

        // For new restaurants, also provision a sensible default delivery zone
        // centered on the restaurant. Admin can edit it later from the
        // restaurant detail page (future iteration).
        if (!input.id) {
            const { error: zoneErr } = await sb.from('delivery_zones').insert({
                restaurant_id: data.id,
                center_lat: input.lat,
                center_lon: input.lon,
                radius_m: 5000,
                fee_cents: 290,
                min_order_cents: 1500,
                allowed_postal_codes: [],
            });
            if (zoneErr) {
                console.warn('[direct-ordering] default delivery_zone insert failed', zoneErr);
            }
        }

        return { ok: true, restaurant: rowToRestaurant(data as RestaurantRow) };
    } catch (e) {
        console.warn('[direct-ordering] upsertRestaurant threw', e);
        return { ok: false, error: 'write_failed' };
    }
}

// --- menu items ------------------------------------------------------------

export async function listMenuItems(restaurantId: string): Promise<MenuItem[]> {
    if (!isSupabaseConfigured()) return mem.mem_listMenuItems(restaurantId);
    try {
        const sb = await createClient();
        if (!sb) return mem.mem_listMenuItems(restaurantId);
        const { data, error } = await sb
            .from('menu_items')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .order('sort_order', { ascending: true });
        if (error || !data) return mem.mem_listMenuItems(restaurantId);
        return data.map(rowToMenuItem);
    } catch {
        return mem.mem_listMenuItems(restaurantId);
    }
}

export async function getMenuItem(id: string): Promise<MenuItem | null> {
    if (!isSupabaseConfigured()) return mem.mem_getMenuItem(id);
    try {
        const sb = await createClient();
        if (!sb) return mem.mem_getMenuItem(id);
        const { data, error } = await sb.from('menu_items').select('*').eq('id', id).maybeSingle();
        if (error || !data) return mem.mem_getMenuItem(id);
        return rowToMenuItem(data);
    } catch {
        return mem.mem_getMenuItem(id);
    }
}

export async function upsertMenuItem(input: Omit<MenuItem, 'id'> & { id?: string }): Promise<MenuItem> {
    if (isSupabaseConfigured() && hasServiceRole()) {
        try {
            const sb = createServiceClient();
            // Only set sizes/customization_groups if the caller actually
            // provided them — otherwise we'd nuke existing seeded values on
            // a partial update from the admin form.
            const row: Record<string, unknown> = {
                restaurant_id: input.restaurantId,
                name: input.name,
                description: input.description || null,
                price_cents: input.priceCents,
                currency: input.currency || 'EUR',
                image_url: input.imageUrl || null,
                category: input.category || null,
                is_available: input.isAvailable,
                sort_order: input.sortOrder,
                updated_at: new Date().toISOString(),
            };
            if (input.sizes !== undefined) row.sizes = input.sizes;
            if (input.customizationGroups !== undefined) row.customization_groups = input.customizationGroups;

            const query = input.id
                ? sb.from('menu_items').update(row).eq('id', input.id).select().single()
                : sb.from('menu_items').insert(row).select().single();
            const { data, error } = await query;
            if (!error && data) return rowToMenuItem(data as MenuItemRow);
            console.warn('[direct-ordering] menu_items upsert failed, using in-memory', error);
        } catch (e) {
            console.warn('[direct-ordering] menu_items upsert threw, using in-memory', e);
        }
    }
    return mem.mem_upsertMenuItem(input);
}

export async function deleteMenuItem(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && hasServiceRole()) {
        try {
            const sb = createServiceClient();
            const { error } = await sb.from('menu_items').delete().eq('id', id);
            if (!error) {
                // Keep in-memory in sync in case the DB-backed read hits the
                // fallback branch on a later call (network blip, etc.).
                mem.mem_deleteMenuItem(id);
                return true;
            }
            console.warn('[direct-ordering] menu_items delete failed, using in-memory', error);
        } catch (e) {
            console.warn('[direct-ordering] menu_items delete threw, using in-memory', e);
        }
    }
    return mem.mem_deleteMenuItem(id);
}

// --- delivery zone ---------------------------------------------------------

export async function getDeliveryZone(restaurantId: string): Promise<DeliveryZone | null> {
    if (!isSupabaseConfigured()) return mem.mem_getDeliveryZone(restaurantId);
    try {
        const sb = await createClient();
        if (!sb) return mem.mem_getDeliveryZone(restaurantId);
        const { data, error } = await sb
            .from('delivery_zones')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .maybeSingle();
        if (error || !data) return mem.mem_getDeliveryZone(restaurantId);
        return rowToZone(data);
    } catch {
        return mem.mem_getDeliveryZone(restaurantId);
    }
}

export async function upsertDeliveryZone(zone: DeliveryZone): Promise<DeliveryZone | null> {
    if (isSupabaseConfigured() && hasServiceRole()) {
        try {
            const sb = createServiceClient();
            const row = {
                restaurant_id: zone.restaurantId,
                center_lat: zone.centerLat,
                center_lon: zone.centerLon,
                radius_m: zone.radiusM,
                fee_cents: zone.feeCents,
                min_order_cents: zone.minOrderCents,
                allowed_postal_codes: zone.allowedPostalCodes,
            };
            // delivery_zones has no unique constraint on restaurant_id at the
            // schema level; we treat one-zone-per-restaurant as an invariant
            // and do a manual upsert.
            const existing = await sb
                .from('delivery_zones')
                .select('id')
                .eq('restaurant_id', zone.restaurantId)
                .maybeSingle();
            const query = existing.data?.id
                ? sb.from('delivery_zones').update(row).eq('id', existing.data.id).select().single()
                : sb.from('delivery_zones').insert(row).select().single();
            const { data, error } = await query;
            if (!error && data) return rowToZone(data as ZoneRow);
            console.warn('[direct-ordering] delivery_zones upsert failed, using in-memory', error);
        } catch (e) {
            console.warn('[direct-ordering] delivery_zones upsert threw, using in-memory', e);
        }
    }
    return mem.mem_upsertDeliveryZone(zone);
}

// --- orders ----------------------------------------------------------------

export async function createOrder(
    input: Omit<Order, 'id' | 'createdAt' | 'status' | 'paymentStatus'> & {
        status?: Order['status'];
        paymentStatus?: Order['paymentStatus'];
    }
): Promise<Order> {
    if (isSupabaseConfigured() && hasServiceRole()) {
        try {
            const sb = createServiceClient();
            const orderRow = {
                restaurant_id: input.restaurantId,
                customer_name: input.customerName,
                customer_phone: input.customerPhone ?? null,
                customer_email: input.customerEmail ?? null,
                delivery_address: input.deliveryAddress,
                delivery_postal_code: input.deliveryPostalCode ?? null,
                delivery_lat: input.deliveryLat ?? null,
                delivery_lon: input.deliveryLon ?? null,
                notes: input.notes ?? null,
                subtotal_cents: input.subtotalCents,
                delivery_fee_cents: input.deliveryFeeCents,
                total_cents: input.totalCents,
                currency: input.currency,
                status: input.status ?? 'pending',
                payment_status: input.paymentStatus ?? 'unpaid',
            };
            const { data: orderData, error: orderErr } = await sb
                .from('direct_orders')
                .insert(orderRow)
                .select()
                .single();
            if (orderErr || !orderData) {
                console.warn('[direct-ordering] direct_orders insert failed, using in-memory', orderErr);
                return mem.mem_createOrder(input);
            }

            const itemRows = input.items.map((it) => ({
                order_id: orderData.id,
                menu_item_id: it.menuItemId,
                name_snapshot: it.nameSnapshot,
                size_snapshot: it.sizeId
                    ? { id: it.sizeId, label: it.sizeLabel ?? null }
                    : null,
                options_snapshot: it.options,
                unit_price_cents_snapshot: it.unitPriceCentsSnapshot,
                quantity: it.quantity,
            }));
            const { error: itemsErr } = await sb.from('direct_order_items').insert(itemRows);
            if (itemsErr) {
                console.warn('[direct-ordering] order_items insert failed', itemsErr);
            }
            return rowToOrder(orderData, input.items);
        } catch (e) {
            console.warn('[direct-ordering] createOrder threw, using in-memory', e);
        }
    }
    return mem.mem_createOrder(input);
}

export async function listOrders(restaurantId: string): Promise<Order[]> {
    if (isSupabaseConfigured() && hasServiceRole()) {
        try {
            const sb = createServiceClient();
            const { data, error } = await sb
                .from('direct_orders')
                .select('*, direct_order_items(*)')
                .eq('restaurant_id', restaurantId)
                .order('created_at', { ascending: false });
            if (!error && data) {
                return data.map((row) =>
                    rowToOrder(row, (row.direct_order_items ?? []).map(orderItemRowToItem)),
                );
            }
            console.warn('[direct-ordering] listOrders failed, using in-memory', error);
        } catch (e) {
            console.warn('[direct-ordering] listOrders threw, using in-memory', e);
        }
    }
    return mem.mem_listOrders(restaurantId);
}

export async function getOrder(id: string): Promise<Order | null> {
    if (isSupabaseConfigured() && hasServiceRole()) {
        try {
            const sb = createServiceClient();
            const { data, error } = await sb
                .from('direct_orders')
                .select('*, direct_order_items(*)')
                .eq('id', id)
                .maybeSingle();
            if (!error && data) {
                return rowToOrder(data, (data.direct_order_items ?? []).map(orderItemRowToItem));
            }
            if (error) {
                console.warn('[direct-ordering] getOrder failed, using in-memory', error);
            }
        } catch (e) {
            console.warn('[direct-ordering] getOrder threw, using in-memory', e);
        }
    }
    return mem.mem_getOrder(id);
}

export async function updateOrder(
    id: string,
    patch: Parameters<typeof mem.mem_updateOrder>[1]
): Promise<Order | null> {
    if (isSupabaseConfigured() && hasServiceRole()) {
        try {
            const sb = createServiceClient();
            const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
            if (patch.status !== undefined) row.status = patch.status;
            if (patch.paymentStatus !== undefined) row.payment_status = patch.paymentStatus;
            if (patch.paymentReference !== undefined) row.payment_reference = patch.paymentReference;
            if (patch.deliveryReference !== undefined) row.delivery_reference = patch.deliveryReference;
            if (patch.paymentProvider !== undefined) row.payment_provider = patch.paymentProvider;
            if (patch.deliveryProvider !== undefined) row.delivery_provider = patch.deliveryProvider;
            const { data, error } = await sb
                .from('direct_orders')
                .update(row)
                .eq('id', id)
                .select('*, direct_order_items(*)')
                .single();
            if (!error && data) {
                return rowToOrder(data, (data.direct_order_items ?? []).map(orderItemRowToItem));
            }
            console.warn('[direct-ordering] updateOrder failed, using in-memory', error);
        } catch (e) {
            console.warn('[direct-ordering] updateOrder threw, using in-memory', e);
        }
    }
    return mem.mem_updateOrder(id, patch);
}

// --- row mappers -----------------------------------------------------------

type OrderRow = {
    id: string; restaurant_id: string; customer_name: string; customer_phone: string | null;
    customer_email: string | null; delivery_address: string; delivery_postal_code: string | null;
    delivery_lat: number | null; delivery_lon: number | null; notes: string | null;
    subtotal_cents: number; delivery_fee_cents: number; total_cents: number; currency: string;
    status: Order['status']; payment_status: Order['paymentStatus'];
    payment_provider: string | null; payment_reference: string | null;
    delivery_provider: string | null; delivery_reference: string | null;
    created_at: string;
};

type OrderItemRow = {
    menu_item_id: string | null;
    name_snapshot: string;
    size_snapshot: { id?: string; label?: string | null } | null;
    options_snapshot: OrderItem['options'] | null;
    unit_price_cents_snapshot: number;
    quantity: number;
};

function orderItemRowToItem(r: OrderItemRow): OrderItem {
    return {
        menuItemId: r.menu_item_id ?? '',
        nameSnapshot: r.name_snapshot,
        sizeId: r.size_snapshot?.id,
        sizeLabel: r.size_snapshot?.label ?? undefined,
        options: r.options_snapshot ?? [],
        unitPriceCentsSnapshot: r.unit_price_cents_snapshot,
        quantity: r.quantity,
    };
}

function rowToOrder(r: OrderRow, items: OrderItem[]): Order {
    return {
        id: r.id,
        restaurantId: r.restaurant_id,
        customerName: r.customer_name,
        customerPhone: r.customer_phone ?? undefined,
        customerEmail: r.customer_email ?? undefined,
        deliveryAddress: r.delivery_address,
        deliveryPostalCode: r.delivery_postal_code ?? undefined,
        deliveryLat: r.delivery_lat ?? undefined,
        deliveryLon: r.delivery_lon ?? undefined,
        notes: r.notes ?? undefined,
        items,
        subtotalCents: r.subtotal_cents,
        deliveryFeeCents: r.delivery_fee_cents,
        totalCents: r.total_cents,
        currency: r.currency,
        status: r.status,
        paymentStatus: r.payment_status,
        paymentProvider: r.payment_provider ?? undefined,
        paymentReference: r.payment_reference ?? undefined,
        deliveryProvider: r.delivery_provider ?? undefined,
        deliveryReference: r.delivery_reference ?? undefined,
        createdAt: r.created_at,
    };
}

type RestaurantRow = {
    id: string; slug: string; name: string; description: string | null;
    address: string | null; lat: number | null; lon: number | null;
    logo_url: string | null; cover_url: string | null; rating: number | null;
    eta_min: number | null; eta_max: number | null; is_active: boolean;
};

function rowToRestaurant(r: RestaurantRow): DirectRestaurant {
    return {
        id: r.id,
        slug: r.slug,
        name: r.name,
        description: r.description ?? '',
        city: 'Jyväskylä', // city resolution skipped in scaffold — restaurant is hardcoded to Jyväskylä
        address: r.address ?? '',
        lat: Number(r.lat ?? 0),
        lon: Number(r.lon ?? 0),
        logoUrl: r.logo_url ?? '',
        coverUrl: r.cover_url ?? '',
        rating: Number(r.rating ?? 0),
        etaMin: r.eta_min ?? 0,
        etaMax: r.eta_max ?? 0,
        isActive: r.is_active,
    };
}

type MenuItemRow = {
    id: string; restaurant_id: string; name: string; description: string | null;
    price_cents: number; currency: string | null; image_url: string | null;
    category: string | null; is_available: boolean; sort_order: number;
    sizes?: unknown; customization_groups?: unknown;
};

function rowToMenuItem(r: MenuItemRow): MenuItem {
    return {
        id: r.id,
        restaurantId: r.restaurant_id,
        name: r.name,
        description: r.description ?? '',
        priceCents: r.price_cents,
        currency: r.currency ?? 'EUR',
        imageUrl: r.image_url ?? '',
        category: r.category ?? '',
        isAvailable: r.is_available,
        sortOrder: r.sort_order,
        sizes: Array.isArray(r.sizes) && r.sizes.length > 0
            ? (r.sizes as MenuItem['sizes'])
            : undefined,
        customizationGroups:
            Array.isArray(r.customization_groups) && r.customization_groups.length > 0
                ? (r.customization_groups as MenuItem['customizationGroups'])
                : undefined,
    };
}

type ZoneRow = {
    restaurant_id: string; center_lat: number; center_lon: number;
    radius_m: number; fee_cents: number; min_order_cents: number;
    allowed_postal_codes: string[] | null;
};

function rowToZone(r: ZoneRow): DeliveryZone {
    return {
        restaurantId: r.restaurant_id,
        centerLat: Number(r.center_lat),
        centerLon: Number(r.center_lon),
        radiusM: r.radius_m,
        feeCents: r.fee_cents,
        minOrderCents: r.min_order_cents,
        allowedPostalCodes: r.allowed_postal_codes ?? [],
    };
}

export type { OrderItem };
