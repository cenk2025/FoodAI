'use server';

import { revalidatePath } from 'next/cache';
import {
    upsertMenuItem,
    deleteMenuItem,
    getRestaurantById,
} from '@/lib/direct-ordering/repository';

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
