'use server';

import { revalidatePath } from 'next/cache';
import {
    upsertMenuItem,
    deleteMenuItem,
    getRestaurantById,
    upsertRestaurant,
    upsertDeliveryZone,
} from '@/lib/direct-ordering/repository';
import type {
    CustomizationGroup,
    CustomizationOption,
    MenuItemSize,
} from '@/lib/direct-ordering/types';

function randomId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

// sizes_json arrives from the admin form as a JSON string. We re-validate
// each row here because the client could send anything; never trust it.
function parseSizesJson(raw: string | undefined): MenuItemSize[] | undefined {
    if (!raw) return undefined;
    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return undefined;
        const cleaned: MenuItemSize[] = [];
        for (const row of parsed) {
            if (!row || typeof row !== 'object') continue;
            const label = typeof row.label === 'string' ? row.label.trim() : '';
            const priceCents = Number(row.priceCents);
            if (!label) continue;
            if (!Number.isFinite(priceCents) || priceCents < 0) continue;
            const id = typeof row.id === 'string' && row.id.length > 0 ? row.id : randomId('sz');
            cleaned.push({ id, label, priceCents: Math.round(priceCents) });
        }
        return cleaned;
    } catch {
        return undefined;
    }
}

// customization_groups_json arrives from the admin form. We re-validate every
// group + option here. Invalid options inside a group are dropped; groups
// without a label or without options are dropped entirely.
function parseCustomizationGroupsJson(raw: string | undefined): CustomizationGroup[] | undefined {
    if (!raw) return undefined;
    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return undefined;
        const cleaned: CustomizationGroup[] = [];
        for (const g of parsed) {
            if (!g || typeof g !== 'object') continue;
            const label = typeof g.label === 'string' ? g.label.trim() : '';
            if (!label) continue;
            const type: 'single' | 'multi' = g.type === 'multi' ? 'multi' : 'single';
            const minSelect = Math.max(0, Math.floor(Number(g.minSelect) || 0));
            const maxSelectRaw = Number(g.maxSelect);
            const maxSelect =
                type === 'multi' && Number.isFinite(maxSelectRaw) && maxSelectRaw > 0
                    ? Math.floor(maxSelectRaw)
                    : type === 'single'
                      ? 1
                      : undefined;
            const freeQuantityRaw = Number(g.freeQuantity);
            const freeQuantity =
                type === 'multi' && Number.isFinite(freeQuantityRaw) && freeQuantityRaw > 0
                    ? Math.floor(freeQuantityRaw)
                    : undefined;
            const helperText =
                typeof g.helperText === 'string' && g.helperText.trim().length > 0
                    ? g.helperText.trim()
                    : undefined;

            if (!Array.isArray(g.options)) continue;
            const options: CustomizationOption[] = [];
            for (const o of g.options) {
                if (!o || typeof o !== 'object') continue;
                const oLabel = typeof o.label === 'string' ? o.label.trim() : '';
                if (!oLabel) continue;
                const oPrice = Number(o.priceCents);
                if (!Number.isFinite(oPrice) || oPrice < 0) continue;
                const oId =
                    typeof o.id === 'string' && o.id.length > 0 ? o.id : randomId('opt');
                options.push({ id: oId, label: oLabel, priceCents: Math.round(oPrice) });
            }
            if (options.length === 0) continue;

            const gId = typeof g.id === 'string' && g.id.length > 0 ? g.id : randomId('grp');
            cleaned.push({
                id: gId,
                label,
                type,
                minSelect,
                maxSelect,
                freeQuantity,
                helperText,
                options,
            });
        }
        return cleaned;
    } catch {
        return undefined;
    }
}

// Admin actions guarded by the existing /admin middleware cookie. Same trust
// boundary as the platform-admin pages — the middleware redirects unauth'd
// requests to /admin/login before this code ever runs.

export async function adminUpsertMenuItem(formData: FormData) {
    const restaurantId = String(formData.get('restaurantId') ?? '');
    const id = formData.get('id') ? String(formData.get('id')) : undefined;
    const name = String(formData.get('name') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const priceEuros = Number(formData.get('price') ?? 0);
    const imageUrl = String(formData.get('imageUrl') ?? '').trim();
    const category = String(formData.get('category') ?? 'Pizza').trim();
    const isAvailable = formData.get('isAvailable') === 'on';
    const sortOrder = Number(formData.get('sortOrder') ?? 99);

    if (!restaurantId || !name || !(priceEuros >= 0)) {
        return { ok: false, error: 'invalid_input' as const };
    }

    const restaurant = await getRestaurantById(restaurantId);
    if (!restaurant) return { ok: false, error: 'restaurant_not_found' as const };

    const sizes = parseSizesJson(formData.get('sizes_json') as string | undefined);
    const customizationGroups = parseCustomizationGroupsJson(
        formData.get('customization_groups_json') as string | undefined,
    );

    await upsertMenuItem({
        id,
        restaurantId,
        name,
        description,
        priceCents: Math.round(priceEuros * 100),
        currency: 'EUR',
        imageUrl,
        category,
        isAvailable,
        sortOrder,
        sizes,
        customizationGroups,
    });

    revalidatePath(`/admin/restaurants/${restaurantId}`);
    revalidatePath(`/restaurant/${restaurant.slug}`);
    return { ok: true as const };
}

export async function adminDeleteMenuItem(formData: FormData) {
    const restaurantId = String(formData.get('restaurantId') ?? '');
    const id = String(formData.get('id') ?? '');
    if (!id || !restaurantId) return { ok: false, error: 'invalid_input' as const };

    const restaurant = await getRestaurantById(restaurantId);
    if (!restaurant) return { ok: false, error: 'restaurant_not_found' as const };

    await deleteMenuItem(id);
    revalidatePath(`/admin/restaurants/${restaurantId}`);
    revalidatePath(`/restaurant/${restaurant.slug}`);
    return { ok: true as const };
}

export type AdminRestaurantFormResult =
    | { ok: true; id: string; slug: string }
    | { ok: false; error: 'invalid_input' | 'duplicate_slug' | 'write_failed'; message?: string };

function normalizeSlug(input: string): string {
    return input
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')      // strip diacritics
        .replace(/[^a-z0-9-]+/g, '-')         // non-alnum → dash
        .replace(/-+/g, '-')                  // collapse dashes
        .replace(/^-|-$/g, '');               // trim leading/trailing
}

export async function adminUpsertRestaurant(formData: FormData): Promise<AdminRestaurantFormResult> {
    const id = formData.get('id') ? String(formData.get('id')) : undefined;
    const name = String(formData.get('name') ?? '').trim();
    const rawSlug = String(formData.get('slug') ?? '').trim();
    const slug = normalizeSlug(rawSlug || name);
    const description = String(formData.get('description') ?? '').trim();
    const cityName = String(formData.get('cityName') ?? 'Jyväskylä').trim();
    const address = String(formData.get('address') ?? '').trim();
    const lat = Number(formData.get('lat') ?? NaN);
    const lon = Number(formData.get('lon') ?? NaN);
    const logoUrl = String(formData.get('logoUrl') ?? '').trim();
    const coverUrl = String(formData.get('coverUrl') ?? '').trim();
    const rating = Number(formData.get('rating') ?? 0);
    const etaMin = Number(formData.get('etaMin') ?? 25);
    const etaMax = Number(formData.get('etaMax') ?? 40);
    const isActive = formData.get('isActive') === 'on';

    if (!name || !slug) {
        return { ok: false, error: 'invalid_input', message: 'name and slug are required' };
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return { ok: false, error: 'invalid_input', message: 'lat/lon must be numbers' };
    }

    const result = await upsertRestaurant({
        id,
        slug,
        name,
        description,
        address,
        lat,
        lon,
        logoUrl,
        coverUrl,
        rating: Number.isFinite(rating) ? rating : 0,
        etaMin: Number.isFinite(etaMin) ? etaMin : 25,
        etaMax: Number.isFinite(etaMax) ? etaMax : 40,
        isActive,
        cityName,
    });

    if (!result.ok) {
        if (result.error === 'duplicate_slug') {
            return { ok: false, error: 'duplicate_slug', message: `slug "${slug}" is already in use` };
        }
        return { ok: false, error: 'write_failed' };
    }

    revalidatePath('/admin/restaurants');
    revalidatePath(`/admin/restaurants/${result.restaurant.id}`);
    revalidatePath('/');
    revalidatePath(`/restaurant/${result.restaurant.slug}`);
    return { ok: true, id: result.restaurant.id, slug: result.restaurant.slug };
}

export type AdminDeliveryZoneResult =
    | { ok: true }
    | { ok: false; error: 'invalid_input' | 'restaurant_not_found' | 'write_failed'; message?: string };

export async function adminUpsertDeliveryZone(formData: FormData): Promise<AdminDeliveryZoneResult> {
    const restaurantId = String(formData.get('restaurantId') ?? '');
    const centerLat = Number(formData.get('centerLat') ?? NaN);
    const centerLon = Number(formData.get('centerLon') ?? NaN);
    const radiusM = Math.round(Number(formData.get('radiusM') ?? NaN));
    const feeEuros = Number(formData.get('feeEuros') ?? NaN);
    const minOrderEuros = Number(formData.get('minOrderEuros') ?? NaN);
    const postalCodesRaw = String(formData.get('postalCodes') ?? '');

    if (!restaurantId) return { ok: false, error: 'invalid_input' };
    if (!Number.isFinite(centerLat) || !Number.isFinite(centerLon)) {
        return { ok: false, error: 'invalid_input', message: 'center lat/lon must be numbers' };
    }
    if (!Number.isFinite(radiusM) || radiusM <= 0) {
        return { ok: false, error: 'invalid_input', message: 'radius must be > 0' };
    }
    if (!Number.isFinite(feeEuros) || feeEuros < 0) {
        return { ok: false, error: 'invalid_input', message: 'fee must be >= 0' };
    }
    if (!Number.isFinite(minOrderEuros) || minOrderEuros < 0) {
        return { ok: false, error: 'invalid_input', message: 'min order must be >= 0' };
    }

    const restaurant = await getRestaurantById(restaurantId);
    if (!restaurant) return { ok: false, error: 'restaurant_not_found' };

    // Comma- or newline-separated postal codes, normalised and deduped.
    const allowedPostalCodes = Array.from(
        new Set(
            postalCodesRaw
                .split(/[\s,;]+/)
                .map((s) => s.replace(/\s+/g, '').trim())
                .filter((s) => s.length > 0),
        ),
    );

    const saved = await upsertDeliveryZone({
        restaurantId,
        centerLat,
        centerLon,
        radiusM,
        feeCents: Math.round(feeEuros * 100),
        minOrderCents: Math.round(minOrderEuros * 100),
        allowedPostalCodes,
    });
    if (!saved) return { ok: false, error: 'write_failed' };

    revalidatePath(`/admin/restaurants/${restaurantId}`);
    revalidatePath(`/restaurant/${restaurant.slug}/checkout`);
    return { ok: true };
}
