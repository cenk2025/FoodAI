# Provider Connectors

## Overview

The provider connector system is designed to fetch offers from various food delivery services and upsert them into the Supabase database. Each connector is implemented as a separate module with strict adherence to Terms of Service (TOS) compliance.

## Architecture

### Core Components

1. **Base Upserter Class** (`lib/connectors/base.ts`)
   - Handles database connections using Supabase service role
   - Provides common upsert functionality for all connectors
   - Manages error handling and logging

2. **Connector Modules** (`lib/connectors/*.ts`)
   - Individual modules for each provider (Wolt, Foodora, ResQ)
   - Each implements a `fetch[Provider]Offers()` function
   - Strict TOS compliance notes included in each file

3. **Runner Script** (`scripts/pull-providers.ts`)
   - Orchestrates the execution of all connectors
   - Handles errors gracefully to prevent one connector failure from stopping others
   - Can be scheduled via CRON jobs

## Implementation Guidelines

### TOS Compliance

Each connector file includes specific TOS compliance notes:
- Use official APIs/partner feeds only
- Implement compliant fetchers with caching and rate limits if scraping is allowed
- Respect rate limits as specified by each provider
- Include proper user-agent headers
- Handle authentication according to provider documentation

### Data Structure

All connectors must return offers in the following format:

```typescript
type Offer = {
  provider_slug: string;
  title: string;
  description?: string;
  original_price?: number;
  discounted_price: number;
  currency?: string;
  pickup?: boolean;
  delivery?: boolean;
  city?: string;
  deep_link: string;
  image_url?: string;
  tags?: string[];
};
```

### Error Handling

- Each connector should handle its own errors
- The runner script catches and logs errors without stopping execution
- Database errors are propagated and logged appropriately

## Adding New Providers

To add a new provider:

1. Create a new connector file in `lib/connectors/`
2. Implement the `fetch[Provider]Offers()` function
3. Include TOS compliance notes specific to the provider
4. Add the provider to the runner script
5. Ensure the provider exists in the Supabase `providers` table

## Scheduling

The provider data pull can be scheduled using:

1. **GitHub Actions** - Using scheduled workflows
2. **Vercel Cron** - Using Vercel's built-in cron functionality
3. **Server crontab** - Using traditional Unix cron jobs

Example crontab entry:
```bash
# Run every hour
0 * * * * cd /path/to/project && pnpm tsx scripts/pull-providers.ts
```

## Environment Variables

The connectors require the following environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE` - Supabase service role key
- Provider-specific API keys (e.g., `WOLT_API_KEY`, `FOODORA_API_KEY`, etc.)

## Testing

To test the connectors manually:
```bash
pnpm tsx scripts/pull-providers.ts
```

## Monitoring

The system logs:
- Start and completion of each provider fetch
- Number of offers upserted per provider
- Any errors encountered during execution