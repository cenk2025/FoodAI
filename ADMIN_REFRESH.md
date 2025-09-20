# Admin Refresh Endpoint

## Overview

This document describes the admin-only endpoint to refresh the materialized view `offer_index` and the GitHub Actions cron job that calls it periodically.

## API Endpoint

### Route
`POST /api/admin/refresh-index`

### Authentication
The endpoint requires a secret token in the `x-cron-token` header that matches the `CRON_TOKEN` environment variable.

### Functionality
When called successfully, the endpoint:
1. Validates the cron token
2. Calls the `refresh_materialized_view` RPC function in Supabase
3. Refreshes the `offer_index` materialized view

### Response
- Success: `{ "ok": true }` (HTTP 200)
- Unauthorized: `{ "ok": false }` (HTTP 401)
- Error: `{ "ok": false, "error": "error message" }` (HTTP 500)

## GitHub Actions Cron Job

### Schedule
The cron job runs every 30 minutes (`*/30 * * * *`).

### Configuration
The workflow requires two secrets to be configured in GitHub:
1. `SITE_URL` - The base URL of your deployed application
2. `CRON_TOKEN` - The secret token that matches the `CRON_TOKEN` environment variable

### Manual Trigger
The workflow can also be manually triggered using the `workflow_dispatch` event.

## Environment Variables

The following environment variables are required:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE` - Supabase service role key
- `CRON_TOKEN` - Secret token for authenticating cron requests

## Security Considerations

1. The endpoint is protected by a secret token
2. The token should be a strong, randomly generated string
3. The token should be stored as a GitHub secret, not in the code
4. The endpoint only accepts POST requests
5. The endpoint should only be accessible over HTTPS in production

## Testing

To test the endpoint manually:
```bash
curl -X POST "https://your-site.com/api/admin/refresh-index" \
  -H "x-cron-token: your_secret_token" \
  -H "Content-Type: application/json"
```

## Monitoring

The endpoint logs errors to the console, which will appear in your hosting platform's logs.