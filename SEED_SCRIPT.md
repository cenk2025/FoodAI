# Seed Script

This script seeds the database with initial providers and offers using the Supabase service role for idempotent operations.

## Prerequisites

.env.local must contain SUPABASE_SERVICE_ROLE (server-only key, never expose to client).

## Running the Script

Using npm script (recommended):
```bash
npm run seed
```

Or directly with tsx:
```bash
npx tsx scripts/seed.ts
```

## Features

- Idempotent provider seeding using upsert with slug conflict resolution
- Offer insertion with duplicate key error handling
- Uses service role for full database access