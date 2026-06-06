import { randomUUID } from 'crypto';
import type {
    DirectRestaurant,
    MenuItem,
    DeliveryZone,
    Order,
    OrderItem,
} from './types';
import { PIZZAPIZZA, PIZZAPIZZA_MENU, PIZZAPIZZA_ZONE } from './seed';

// Module-level singleton. Survives between requests within a single Node
// process (i.e. one `next dev` run); reset on every restart. Good enough for
// demo + tests; the Supabase path takes over once env vars are set.

type Store = {
    restaurants: Map<string, DirectRestaurant>;
    menuItems: Map<string, MenuItem>;
    zones: Map<string, DeliveryZone>; // keyed by restaurantId
    orders: Map<string, Order>;
};

declare global {
    // eslint-disable-next-line no-var
    var __foodai_direct_store: Store | undefined;
}

function createStore(): Store {
    const store: Store = {
        restaurants: new Map(),
        menuItems: new Map(),
        zones: new Map(),
        orders: new Map(),
    };
    store.restaurants.set(PIZZAPIZZA.id, { ...PIZZAPIZZA });
    PIZZAPIZZA_MENU.forEach((m) => store.menuItems.set(m.id, { ...m }));
    store.zones.set(PIZZAPIZZA_ZONE.restaurantId, { ...PIZZAPIZZA_ZONE });
    return store;
}

export function getStore(): Store {
    if (!globalThis.__foodai_direct_store) {
        globalThis.__foodai_direct_store = createStore();
    }
    return globalThis.__foodai_direct_store;
}

// --- restaurants -----------------------------------------------------------

export function mem_listRestaurants(): DirectRestaurant[] {
    return [...getStore().restaurants.values()].filter((r) => r.isActive);
}

export function mem_getRestaurantBySlug(slug: string): DirectRestaurant | null {
    return [...getStore().restaurants.values()].find((r) => r.slug === slug) ?? null;
}

export function mem_getRestaurantById(id: string): DirectRestaurant | null {
    return getStore().restaurants.get(id) ?? null;
}

// --- menu items ------------------------------------------------------------

export function mem_listMenuItems(restaurantId: string): MenuItem[] {
    return [...getStore().menuItems.values()]
        .filter((m) => m.restaurantId === restaurantId)
        .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function mem_getMenuItem(id: string): MenuItem | null {
    return getStore().menuItems.get(id) ?? null;
}

export function mem_upsertMenuItem(input: Omit<MenuItem, 'id'> & { id?: string }): MenuItem {
    const id = input.id ?? `mi-${randomUUID()}`;
    const item: MenuItem = { ...input, id };
    getStore().menuItems.set(id, item);
    return item;
}

export function mem_deleteMenuItem(id: string): boolean {
    return getStore().menuItems.delete(id);
}

// --- delivery zone ---------------------------------------------------------

export function mem_getDeliveryZone(restaurantId: string): DeliveryZone | null {
    return getStore().zones.get(restaurantId) ?? null;
}

// --- orders ----------------------------------------------------------------

export function mem_createOrder(
    input: Omit<Order, 'id' | 'createdAt' | 'status' | 'paymentStatus'> & {
        status?: Order['status'];
        paymentStatus?: Order['paymentStatus'];
    }
): Order {
    const order: Order = {
        ...input,
        id: `ord-${randomUUID()}`,
        createdAt: new Date().toISOString(),
        status: input.status ?? 'pending',
        paymentStatus: input.paymentStatus ?? 'unpaid',
    };
    getStore().orders.set(order.id, order);
    return order;
}

export function mem_listOrders(restaurantId: string): Order[] {
    return [...getStore().orders.values()]
        .filter((o) => o.restaurantId === restaurantId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function mem_getOrder(id: string): Order | null {
    return getStore().orders.get(id) ?? null;
}

export function mem_updateOrder(
    id: string,
    patch: Partial<Pick<Order, 'status' | 'paymentStatus' | 'paymentReference' | 'deliveryReference' | 'paymentProvider' | 'deliveryProvider'>>
): Order | null {
    const existing = getStore().orders.get(id);
    if (!existing) return null;
    const updated: Order = { ...existing, ...patch };
    getStore().orders.set(id, updated);
    return updated;
}

export type { OrderItem };
