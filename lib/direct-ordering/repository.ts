import { createClient } from '@/lib/supabase/server';
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
    // For the demo we keep the source of truth in memory regardless of DB —
    // writing through Supabase needs an admin-role JWT that we don't yet
    // mint server-side. When that's added, this function can dual-write.
    return mem.mem_upsertMenuItem(input);
}

export async function deleteMenuItem(id: string): Promise<boolean> {
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

// --- orders ----------------------------------------------------------------

export async function createOrder(
    input: Omit<Order, 'id' | 'createdAt' | 'status' | 'paymentStatus'> & {
        status?: Order['status'];
        paymentStatus?: Order['paymentStatus'];
    }
): Promise<Order> {
    // Same reasoning as upsertMenuItem — admin-role inserts require service
    // credentials that aren't wired up. The in-memory ledger is authoritative
    // for the demo; admin dashboard reads through this same path.
    return mem.mem_createOrder(input);
}

export async function listOrders(restaurantId: string): Promise<Order[]> {
    return mem.mem_listOrders(restaurantId);
}

export async function getOrder(id: string): Promise<Order | null> {
    return mem.mem_getOrder(id);
}

export async function updateOrder(
    id: string,
    patch: Parameters<typeof mem.mem_updateOrder>[1]
): Promise<Order | null> {
    return mem.mem_updateOrder(id, patch);
}

// --- row mappers -----------------------------------------------------------

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
