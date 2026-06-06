// Shopify payment stub.
//
// STATUS: PLACEHOLDER — credentials, app type (custom vs public), and the
// checkout strategy (Storefront API draft order, headless Checkout Sheet Kit,
// or a redirect to the store's hosted checkout) will be decided once Shopify
// access is granted. The interface here is shaped around the redirect-to-
// hosted-checkout flow because that's the lowest-integration option.

import {
    PaymentProvider,
    PaymentProviderUnavailableError,
    Checkout,
    CheckoutStatus,
    CreateCheckoutRequest,
} from './types';

type ShopifyConfig = {
    storeDomain?: string;            // e.g. "pizzapizza.myshopify.com"
    storefrontToken?: string;        // Storefront API access token
    apiVersion?: string;             // e.g. "2025-01"
};

function readConfig(): ShopifyConfig {
    return {
        storeDomain: process.env.SHOPIFY_STORE_DOMAIN,
        storefrontToken: process.env.SHOPIFY_STOREFRONT_TOKEN,
        apiVersion: process.env.SHOPIFY_API_VERSION,
    };
}

class ShopifyPaymentProvider implements PaymentProvider {
    readonly name = 'shopify';

    get isConfigured(): boolean {
        const c = readConfig();
        return Boolean(c.storeDomain && c.storefrontToken);
    }

    async createCheckout(req: CreateCheckoutRequest): Promise<Checkout> {
        if (!this.isConfigured) {
            // Simulation: returns a pseudo checkout URL pointing back at our
            // own success page so the end-to-end flow can be walked through
            // without leaving the local dev server.
            const checkoutId = `sim-checkout-${Date.now()}`;
            const successUrl = new URL(req.successUrl);
            successUrl.searchParams.set('checkout_id', checkoutId);
            successUrl.searchParams.set('simulated', '1');
            return {
                provider: this.name,
                checkoutId,
                checkoutUrl: successUrl.toString(),
                expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
            };
        }
        // Real path: mutation { checkoutCreate(input: { lineItems: ... }) }
        // against https://{storeDomain}/api/{apiVersion}/graphql.json
        throw new PaymentProviderUnavailableError(
            this.name,
            'real Shopify client not implemented yet; waiting on store credentials',
        );
        void req;
    }

    async getStatus(checkoutId: string): Promise<CheckoutStatus> {
        if (!this.isConfigured) {
            return {
                provider: this.name,
                checkoutId,
                paymentStatus: checkoutId.startsWith('sim-checkout') ? 'paid' : 'pending',
            };
        }
        throw new PaymentProviderUnavailableError(
            this.name,
            'real Shopify client not implemented yet; waiting on store credentials',
        );
    }
}

export const shopifyPayments: PaymentProvider = new ShopifyPaymentProvider();
