# Webhook Testing

## Overview
This document describes how to test the commissions webhook endpoint.

## Environment Setup
1. Ensure `COMMISSIONS_WEBHOOK_SECRET` is set in your environment variables
2. For local testing, you can set it in your terminal:
   ```bash
   export COMMISSIONS_WEBHOOK_SECRET=your_test_secret
   ```

## Using the Comprehensive Test Script
Run the comprehensive test script to test various scenarios:
```bash
./scripts/test-commissions-webhook.sh
```

You can also specify custom endpoint and secret:
```bash
./scripts/test-commissions-webhook.sh http://your-domain.com/api/webhooks/commissions your_custom_secret
```

## Using the Node.js Test Script
Run the Node.js test script to send a sample webhook request:
```bash
node scripts/test-webhook.js
```

## Manual Testing with curl
You can also test manually with curl:

1. Create a payload file (payload.json):
   ```json
   {
     "provider_slug": "wolt",
     "conversion_id": "test_12345",
     "gross_amount": 10.50,
     "commission_amount": 1.05,
     "currency": "EUR",
     "status": "approved",
     "occurred_at": "2023-01-01T12:00:00Z"
   }
   ```

2. Generate the signature:
   ```bash
   PAYLOAD=$(cat payload.json)
   SECRET="your_webhook_secret"
   SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/.* //')
   ```

3. Send the request:
   ```bash
   curl -X POST "http://localhost:3000/api/webhooks/commissions" \
     -H "Content-Type: application/json" \
     -H "x-signature: sha256=$SIGNATURE" \
     -d "@payload.json"
   ```

## Expected Responses
- Valid request: `{"ok":true}`
- Invalid signature: `{"ok":false,"error":"bad signature"}` (401)
- Provider not found: `{"ok":false,"error":"provider not found"}` (400)
- Database error: `{"ok":false,"error":"error message"}` (500)

## Testing Error Cases
1. Send request without signature header (should return 401)
2. Send request with invalid signature (should return 401)
3. Send request with non-existent provider_slug (should return 400)
4. Send malformed JSON (should return 500)