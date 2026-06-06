// Provider-agnostic delivery interface. The shape mirrors the request /
// response that real logistics APIs (Uber Direct, Wolt Drive, etc.) expose so
// we can swap implementations in without changing call sites.

export type DeliveryAddress = {
    streetAddress: string;
    postalCode: string;
    city: string;
    country: string;
    lat?: number;
    lon?: number;
    contactName: string;
    contactPhone: string;
};

export type DeliveryQuoteRequest = {
    pickup: DeliveryAddress;
    dropoff: DeliveryAddress;
    pickupReadyAt?: string;     // ISO timestamp
};

export type DeliveryQuote = {
    provider: string;
    quoteId: string;
    feeCents: number;
    currency: string;
    etaMinutes: number;
    expiresAt: string;          // ISO timestamp
};

export type CreateDeliveryRequest = {
    quoteId: string;
    externalOrderId: string;
    pickup: DeliveryAddress;
    dropoff: DeliveryAddress;
    items: Array<{ name: string; quantity: number }>;
    customerNotes?: string;
};

export type DeliveryRecord = {
    provider: string;
    deliveryId: string;
    status:
        | 'pending'
        | 'courier_assigned'
        | 'picked_up'
        | 'dropped_off'
        | 'cancelled'
        | 'failed';
    trackingUrl?: string;
};

export interface DeliveryProvider {
    readonly name: string;
    readonly isConfigured: boolean;
    quote(req: DeliveryQuoteRequest): Promise<DeliveryQuote>;
    create(req: CreateDeliveryRequest): Promise<DeliveryRecord>;
    getStatus(deliveryId: string): Promise<DeliveryRecord>;
}

export class DeliveryProviderUnavailableError extends Error {
    constructor(provider: string, reason: string) {
        super(`[${provider}] not available: ${reason}`);
        this.name = 'DeliveryProviderUnavailableError';
    }
}
