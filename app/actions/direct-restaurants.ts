'use server';

import { listRestaurants } from '@/lib/direct-ordering/repository';
import type { DirectRestaurant } from '@/lib/direct-ordering/types';

// Used by the homepage to surface direct-order restaurants. Returns the same
// shape the public site needs (no admin-only fields), so it's safe to call
// from a client component.

export async function fetchActiveDirectRestaurants(): Promise<DirectRestaurant[]> {
    const all = await listRestaurants();
    return all.filter((r) => r.isActive);
}
