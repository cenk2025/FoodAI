'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import {
    getRestaurantBySlug,
    listMenuItems,
    getDeliveryZone,
    createOrder,
    updateOrder,
} from '@/lib/direct-ordering/repository';
import { checkDeliveryZone } from '@/lib/direct-ordering/delivery-zone';
import { shopifyPayments } from '@/lib/integrations/payments/shopify';
import { uberEatsDelivery } from '@/lib/integrations/delivery/uber-eats-delivery';
import { UBER_EATS_DELIVERY_FEE_CENTS } from '@/lib/direct-ordering/constants';
import type {
    OrderItem,
    OrderOptionSnapshot,
} from '@/lib/direct-ordering/types';
import { computeUnitPrice } from '@/lib/direct-ordering/CartContext';

export type PlaceOrderInput = {
    slug: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    deliveryStreet: string;
    deliveryPostalCode: string;
    notes?: string;
    cartLines: Array<{
        menuItemId: string;
        quantity: number;
        sizeId?: string;
        selectedOptions: Array<{ groupId: string; optionId: string }>;
    }>;
};

export type PlaceOrderResult =
    | { ok: true; redirectUrl: string }
    | {
          ok: false;
          error:
              | 'restaurant_not_found'
              | 'menu_mismatch'
              | 'invalid_selection'
              | 'empty_cart'
              | 'out_of_zone'
              | 'below_minimum'
              | 'payment_unavailable'
              | 'unknown';
          message?: string;
      };

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
    const restaurant = await getRestaurantBySlug(input.slug);
    if (!restaurant) return { ok: false, error: 'restaurant_not_found' };

    if (!input.cartLines || input.cartLines.length === 0) {
        return { ok: false, error: 'empty_cart' };
    }

    // Resolve menu items server-side so the price snapshot is authoritative.
    const menuItems = await listMenuItems(restaurant.id);
    const byId = new Map(menuItems.map((m) => [m.id, m]));

    const orderItems: OrderItem[] = [];
    for (const line of input.cartLines) {
        const item = byId.get(line.menuItemId);
        if (!item) return { ok: false, error: 'menu_mismatch' };

        // Validate the cart line against the live menu — same rules the modal
        // enforces, but trustworthy because it runs server-side.
        const validationError = validateSelection(item, line.sizeId, line.selectedOptions);
        if (validationError) {
            return { ok: false, error: 'invalid_selection', message: validationError };
        }

        const unitPrice = computeUnitPrice(item, line.sizeId, line.selectedOptions);
        const size = item.sizes?.find((s) => s.id === line.sizeId);

        const optionSnapshots: OrderOptionSnapshot[] = [];
        for (const sel of line.selectedOptions) {
            const group = item.customizationGroups?.find((g) => g.id === sel.groupId);
            const opt = group?.options.find((o) => o.id === sel.optionId);
            if (!group || !opt) continue;
            optionSnapshots.push({
                groupId: group.id,
                groupLabel: group.label,
                optionId: opt.id,
                optionLabel: opt.label,
                priceCentsSnapshot: opt.priceCents,
            });
        }

        orderItems.push({
            menuItemId: item.id,
            nameSnapshot: item.name,
            sizeId: size?.id,
            sizeLabel: size?.label,
            options: optionSnapshots,
            unitPriceCentsSnapshot: unitPrice,
            quantity: line.quantity,
        });
    }

    const subtotalCents = orderItems.reduce(
        (acc, it) => acc + it.unitPriceCentsSnapshot * it.quantity,
        0,
    );

    const zone = await getDeliveryZone(restaurant.id);
    const zoneCheck = checkDeliveryZone(zone, { postalCode: input.deliveryPostalCode });
    if (!zoneCheck.inZone) {
        return { ok: false, error: 'out_of_zone', message: zoneCheck.reason };
    }

    if (subtotalCents < zoneCheck.minOrderCents) {
        return { ok: false, error: 'below_minimum' };
    }

    // Delivery is handled by Uber Eats for every direct order, with a flat
    // platform-wide fee. The zone.feeCents value (if any) is ignored here.
    const deliveryFeeCents = UBER_EATS_DELIVERY_FEE_CENTS;
    const totalCents = subtotalCents + deliveryFeeCents;

    const order = await createOrder({
        restaurantId: restaurant.id,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerEmail: input.customerEmail,
        deliveryAddress: input.deliveryStreet,
        deliveryPostalCode: input.deliveryPostalCode,
        notes: input.notes,
        items: orderItems,
        subtotalCents,
        deliveryFeeCents,
        totalCents,
        currency: 'EUR',
    });

    // Build a delivery quote so the Uber Direct integration is exercised even
    // in simulation mode (real path requires credentials).
    let deliveryReference: string | undefined;
    try {
        const pickup = {
            streetAddress: restaurant.address,
            postalCode: '40100',
            city: restaurant.city,
            country: 'FI',
            contactName: restaurant.name,
            contactPhone: '+358000000000',
            lat: restaurant.lat,
            lon: restaurant.lon,
        };
        const dropoff = {
            streetAddress: input.deliveryStreet,
            postalCode: input.deliveryPostalCode,
            city: restaurant.city,
            country: 'FI',
            contactName: input.customerName,
            contactPhone: input.customerPhone,
        };
        const quote = await uberEatsDelivery.quote({ pickup, dropoff });
        const delivery = await uberEatsDelivery.create({
            quoteId: quote.quoteId,
            externalOrderId: order.id,
            pickup,
            dropoff,
            items: orderItems.map((i) => ({ name: i.nameSnapshot, quantity: i.quantity })),
            customerNotes: input.notes,
        });
        deliveryReference = delivery.deliveryId;
    } catch {
        deliveryReference = undefined;
    }

    // Build the success URL the payment provider will redirect back to.
    const reqHeaders = await headers();
    const proto = reqHeaders.get('x-forwarded-proto') ?? 'http';
    const host = reqHeaders.get('host') ?? 'localhost:3000';
    const baseUrl = `${proto}://${host}`;
    const successUrl = `${baseUrl}/restaurant/${input.slug}/checkout/success?order=${order.id}`;
    const cancelUrl = `${baseUrl}/restaurant/${input.slug}/checkout?canceled=1`;

    let checkoutUrl: string;
    let paymentReference: string;
    try {
        const checkout = await shopifyPayments.createCheckout({
            externalOrderId: order.id,
            items: orderItems.map((i) => ({
                name: i.sizeLabel ? `${i.nameSnapshot} (${i.sizeLabel})` : i.nameSnapshot,
                quantity: i.quantity,
                unitPriceCents: i.unitPriceCentsSnapshot,
                currency: 'EUR',
            })),
            customerEmail: input.customerEmail,
            deliveryFeeCents,
            successUrl,
            cancelUrl,
            locale: 'fi',
        });
        checkoutUrl = checkout.checkoutUrl;
        paymentReference = checkout.checkoutId;
    } catch {
        return { ok: false, error: 'payment_unavailable' };
    }

    await updateOrder(order.id, {
        paymentProvider: 'shopify',
        paymentReference,
        paymentStatus: 'pending',
        deliveryProvider: 'uber_eats',
        deliveryReference,
    });

    return { ok: true, redirectUrl: checkoutUrl };
}

function validateSelection(
    item: { sizes?: Array<{ id: string }>; customizationGroups?: Array<{
        id: string; type: 'single' | 'multi'; minSelect: number; maxSelect?: number;
        options: Array<{ id: string }>;
    }> },
    sizeId: string | undefined,
    selectedOptions: Array<{ groupId: string; optionId: string }>,
): string | null {
    if (item.sizes && item.sizes.length > 0) {
        if (!sizeId || !item.sizes.some((s) => s.id === sizeId)) {
            return 'size_required';
        }
    }
    for (const g of item.customizationGroups ?? []) {
        const picks = selectedOptions.filter((s) => s.groupId === g.id);
        if (picks.length < g.minSelect) return `group_min:${g.id}`;
        if (g.maxSelect != null && picks.length > g.maxSelect) return `group_max:${g.id}`;
        for (const p of picks) {
            if (!g.options.some((o) => o.id === p.optionId)) return `option_unknown:${p.optionId}`;
        }
    }
    return null;
}

export async function placeOrderAndRedirect(input: PlaceOrderInput): Promise<PlaceOrderResult> {
    const result = await placeOrder(input);
    if (result.ok) redirect(result.redirectUrl);
    return result;
}
