# Commissions Webhook Endpoint

## Overview
This webhook endpoint securely receives commission data from external providers with HMAC-SHA256 signature verification to ensure authenticity.

## Endpoint
`POST /api/webhooks/commissions`

## Security
- Uses HMAC-SHA256 signature verification
- Requires `x-signature` header with HMAC hash
- Verifies signature using `COMMISSIONS_WEBHOOK_SECRET` environment variable
- Rejects requests with invalid signatures

## Data Format
Expected JSON payload:
```json
{
  "provider_slug": "string",           // Required: Provider identifier (e.g., "wolt", "foodora")
  "conversion_id": "string",           // Required: Unique conversion identifier
  "clickout_id": "string",             // Optional: Clickout reference
  "offer_id": "string",                // Optional: Offer reference
  "gross_amount": "number",            // Required: Gross amount in currency units
  "commission_amount": "number",       // Required: Commission amount in currency units
  "currency": "string",                // Optional: Currency code (default: "EUR")
  "status": "string",                  // Optional: Status (default: "pending")
  "occurred_at": "string"              // Optional: ISO timestamp of when the commission occurred
}
```

## Processing
- Looks up provider by slug to get internal ID
- Upserts commission record using provider_id and external_conversion_id as conflict constraint
- Uses Supabase service role for database operations
- Returns JSON response with success status

## Environment Variables
- `COMMISSIONS_WEBHOOK_SECRET` - Secret key for HMAC signature verification
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE` - Supabase service role key

## Response Codes
- 200: Success
- 400: Bad request (missing data, provider not found)
- 401: Unauthorized (missing signature, invalid signature)
- 500: Internal server error (database error)

## Usage Example
```bash
curl -X POST "https://your-site.com/api/webhooks/commissions" \
  -H "Content-Type: application/json" \
  -H "x-signature: sha256=HMAC_SIGNATURE_HERE" \
  -d '{
    "provider_slug": "wolt",
    "conversion_id": "conv_12345",
    "gross_amount": 10.50,
    "commission_amount": 1.05,
    "currency": "EUR",
    "status": "approved",
    "occurred_at": "2023-01-01T12:00:00Z"
  }'
```

## Signature Verification
To generate the signature for testing:
```javascript
const crypto = require('crypto');
const secret = 'YOUR_WEBHOOK_SECRET';
const payload = JSON.stringify(payloadData);
const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
// Send with header: x-signature: sha256=${signature}
```