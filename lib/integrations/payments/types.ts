// Provider-agnostic payment interface. Modeled to fit Shopify's hosted
// checkout flow (the planned provider) but generic enough for Stripe / Adyen
// / Mollie if the choice changes later.

export type PaymentLineItem = {
    name: string;
    quantity: number;
    unitPriceCents: number;
    currency: string;
};

export type CreateCheckoutRequest = {
    externalOrderId: string;
    items: PaymentLineItem[];
    customerEmail?: string;
    deliveryFeeCents?: number;
    successUrl: string;
    cancelUrl: string;
    locale?: 'fi' | 'en';
};

export type Checkout = {
    provider: string;
    checkoutId: string;
    checkoutUrl: string;          // hosted URL the user is redirected to
    expiresAt?: string;
};

export type CheckoutStatus = {
    provider: string;
    checkoutId: string;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';
    paymentReference?: string;    // platform-side order ID (e.g. Shopify order number)
};

export interface PaymentProvider {
    readonly name: string;
    readonly isConfigured: boolean;
    createCheckout(req: CreateCheckoutRequest): Promise<Checkout>;
    getStatus(checkoutId: string): Promise<CheckoutStatus>;
}

export class PaymentProviderUnavailableError extends Error {
    constructor(provider: string, reason: string) {
        super(`[${provider}] not available: ${reason}`);
        this.name = 'PaymentProviderUnavailableError';
    }
}
