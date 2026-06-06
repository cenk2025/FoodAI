// Core domain types for FoodAi's direct-ordering module (PizzaPizza-style flow).
// Kept intentionally independent of the aggregator's `OfferWithDetails` shape
// so the two systems evolve separately.

export type DirectRestaurant = {
    id: string;
    slug: string;
    name: string;
    description: string;
    city: string;
    address: string;
    lat: number;
    lon: number;
    logoUrl: string;
    coverUrl: string;
    rating: number;
    etaMin: number;
    etaMax: number;
    isActive: boolean;
};

// Size variant for a menu item. Each size carries its own absolute price.
// If a MenuItem has no sizes[], its top-level priceCents is used directly.
export type MenuItemSize = {
    id: string;
    label: string;        // e.g. "Normaali", "Perhepizza"
    priceCents: number;   // absolute price for this size
};

// One option inside a customization group (a topping, a crust type, ...).
export type CustomizationOption = {
    id: string;
    label: string;
    priceCents: number;   // surcharge, always >= 0 in our scaffold
};

// A group of customization choices. Two kinds:
//   - type: 'single' → radio-style, exactly one pick (Wolt: "Valitse pohja")
//   - type: 'multi'  → checkbox, with optional minSelect / maxSelect / freeQuantity
//
// freeQuantity (multi only): first N selected options are free, the rest charge
// their priceCents. Matches Wolt's "Ensimmäiset 4 ovat ilmaisia" pattern.
export type CustomizationGroup = {
    id: string;
    label: string;
    type: 'single' | 'multi';
    minSelect: number;
    maxSelect?: number;
    freeQuantity?: number;
    helperText?: string;
    options: CustomizationOption[];
};

export type MenuItem = {
    id: string;
    restaurantId: string;
    name: string;
    description: string;
    priceCents: number;                       // fallback / base price
    currency: string;
    imageUrl: string;
    category: string;
    isAvailable: boolean;
    sortOrder: number;
    sizes?: MenuItemSize[];                   // when present, customer must pick one
    customizationGroups?: CustomizationGroup[];
};

export type DeliveryZone = {
    restaurantId: string;
    centerLat: number;
    centerLon: number;
    radiusM: number;
    feeCents: number;
    minOrderCents: number;
    allowedPostalCodes: string[];
};

export type OrderStatus =
    | 'pending'
    | 'paid'
    | 'preparing'
    | 'ready'
    | 'in_delivery'
    | 'delivered'
    | 'cancelled';

export type PaymentStatus =
    | 'unpaid'
    | 'pending'
    | 'paid'
    | 'failed'
    | 'refunded';

// Snapshot of one chosen option, frozen at order time.
export type OrderOptionSnapshot = {
    groupId: string;
    groupLabel: string;
    optionId: string;
    optionLabel: string;
    priceCentsSnapshot: number;
};

export type OrderItem = {
    menuItemId: string;
    nameSnapshot: string;
    sizeId?: string;
    sizeLabel?: string;
    options: OrderOptionSnapshot[];
    unitPriceCentsSnapshot: number;           // base + size + sum(options) at time of order
    quantity: number;
};

export type Order = {
    id: string;
    restaurantId: string;
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    deliveryAddress: string;
    deliveryPostalCode?: string;
    deliveryLat?: number;
    deliveryLon?: number;
    notes?: string;
    items: OrderItem[];
    subtotalCents: number;
    deliveryFeeCents: number;
    totalCents: number;
    currency: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentProvider?: string;
    paymentReference?: string;
    deliveryProvider?: string;
    deliveryReference?: string;
    createdAt: string;
};

// One row in the live cart. Same menu item with different size or options is a
// separate line (Wolt parity). `lineId` is a deterministic hash of the
// selections so re-adding the exact same combination collapses into one line.
export type CartLine = {
    lineId: string;
    menuItemId: string;
    quantity: number;
    sizeId?: string;
    selectedOptions: Array<{ groupId: string; optionId: string }>;
};
