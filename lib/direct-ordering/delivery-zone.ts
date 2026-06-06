import type { DeliveryZone } from './types';

// Haversine distance between two lat/lon points in metres.
export function haversineMeters(
    lat1: number, lon1: number, lat2: number, lon2: number,
): number {
    const R = 6_371_000;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
}

export type ZoneCheckResult =
    | { inZone: true; distanceM: number; feeCents: number; minOrderCents: number }
    | { inZone: false; reason: 'no_zone' | 'out_of_radius' | 'postal_code_not_allowed' | 'missing_address'; distanceM?: number };

export type ZoneCheckInput = {
    postalCode?: string;
    lat?: number;
    lon?: number;
};

/**
 * Decide whether a delivery address is in zone.
 *
 * Stub logic (matches the demo seed):
 *   1. If postal code is supplied → must match the zone's allowlist.
 *   2. Else if lat/lon supplied → Haversine against the zone center / radius.
 *   3. Else → caller didn't give us enough to decide.
 *
 * Real implementation should call a geocoder (Google / Mapbox / Posti) to
 * resolve the address to lat/lon, then check against a polygon.
 */
export function checkDeliveryZone(zone: DeliveryZone | null, input: ZoneCheckInput): ZoneCheckResult {
    if (!zone) return { inZone: false, reason: 'no_zone' };

    if (input.postalCode) {
        const normalized = input.postalCode.replace(/\s+/g, '');
        const allowed = zone.allowedPostalCodes.includes(normalized);
        if (!allowed) {
            return { inZone: false, reason: 'postal_code_not_allowed' };
        }
        return {
            inZone: true,
            distanceM: 0,
            feeCents: zone.feeCents,
            minOrderCents: zone.minOrderCents,
        };
    }

    if (typeof input.lat === 'number' && typeof input.lon === 'number') {
        const distanceM = haversineMeters(zone.centerLat, zone.centerLon, input.lat, input.lon);
        if (distanceM > zone.radiusM) {
            return { inZone: false, reason: 'out_of_radius', distanceM };
        }
        return {
            inZone: true,
            distanceM,
            feeCents: zone.feeCents,
            minOrderCents: zone.minOrderCents,
        };
    }

    return { inZone: false, reason: 'missing_address' };
}
