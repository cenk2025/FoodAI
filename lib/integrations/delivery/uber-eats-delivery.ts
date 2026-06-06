// Uber Direct (Uber Eats logistics) delivery stub.
//
// STATUS: PLACEHOLDER — no partnership agreement signed yet, no real
// credentials provisioned. The shape of every call is modeled on the public
// Uber Direct API (https://developer.uber.com/docs/deliveries) so the wiring
// only needs an auth token swap and base URL flip once the agreement is in
// place. Do NOT remove the "isConfigured = false" gate; the rest of the app
// relies on it to short-circuit into the simulation path.

import {
    DeliveryProvider,
    DeliveryProviderUnavailableError,
    DeliveryQuote,
    DeliveryQuoteRequest,
    DeliveryRecord,
    CreateDeliveryRequest,
} from './types';

type UberDirectConfig = {
    clientId?: string;
    clientSecret?: string;
    customerId?: string;        // Uber Direct merchant ("customer") ID
    baseUrl?: string;           // typically https://api.uber.com/v1/customers/{customer_id}/deliveries
};

function readConfig(): UberDirectConfig {
    return {
        clientId: process.env.UBER_DIRECT_CLIENT_ID,
        clientSecret: process.env.UBER_DIRECT_CLIENT_SECRET,
        customerId: process.env.UBER_DIRECT_CUSTOMER_ID,
        baseUrl: process.env.UBER_DIRECT_BASE_URL,
    };
}

class UberEatsDeliveryProvider implements DeliveryProvider {
    readonly name = 'uber_eats';

    get isConfigured(): boolean {
        const c = readConfig();
        return Boolean(c.clientId && c.clientSecret && c.customerId);
    }

    async quote(req: DeliveryQuoteRequest): Promise<DeliveryQuote> {
        if (!this.isConfigured) {
            // Simulation: deterministic quote so the checkout UI can render
            // a fee + ETA even without credentials.
            return {
                provider: this.name,
                quoteId: `sim-quote-${Date.now()}`,
                feeCents: 290,
                currency: 'EUR',
                etaMinutes: 35,
                expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
            };
        }
        // Real path (left intentionally unimplemented; throws to make accidental
        // partial wiring obvious in logs):
        // POST {baseUrl}/delivery_quotes
        // Body: { pickup_address, dropoff_address, pickup_ready_dt }
        throw new DeliveryProviderUnavailableError(
            this.name,
            'real client not implemented yet; waiting on Uber Direct credentials',
        );
        // The req parameter is intentionally retained for the real implementation.
        void req;
    }

    async create(req: CreateDeliveryRequest): Promise<DeliveryRecord> {
        if (!this.isConfigured) {
            return {
                provider: this.name,
                deliveryId: `sim-delivery-${Date.now()}`,
                status: 'pending',
                trackingUrl: undefined,
            };
        }
        // POST {baseUrl}/deliveries with the quote_id from the prior call
        throw new DeliveryProviderUnavailableError(
            this.name,
            'real client not implemented yet; waiting on Uber Direct credentials',
        );
        void req;
    }

    async getStatus(deliveryId: string): Promise<DeliveryRecord> {
        if (!this.isConfigured) {
            return {
                provider: this.name,
                deliveryId,
                status: 'pending',
            };
        }
        throw new DeliveryProviderUnavailableError(
            this.name,
            'real client not implemented yet; waiting on Uber Direct credentials',
        );
    }
}

export const uberEatsDelivery: DeliveryProvider = new UberEatsDeliveryProvider();
