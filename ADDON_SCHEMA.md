# Addon Schema Implementation

This document describes the implementation of the addon schema that includes clickouts, commissions, profiles, favorites, alerts, and their RLS policies along with admin RPCs.

## Schema Overview

The addon schema implements the following tables:

1. **clickouts** - Tracks user clicks on offers (CPC logging)
2. **commissions** - Tracks commissions from conversions (CPA reconciliation)
3. **profiles** - User profiles with admin flag
4. **favorites** - User's favorite offers
5. **alerts** - User-configured alerts for specific offers

## Implementation Files

1. **[db/schema.sql](file:///Users/cenkyakinlar/Documents/Dokumentit%20%E2%80%93%20CenkAir%20-%20MacBook%20Air/DREAMWEAVER/FOODAI/db/schema.sql)** - Updated main schema with favorites and alerts tables
2. **[db/patch_addon_schema.sql](file:///Users/cenkyakinlar/Documents/Dokumentit%20%E2%80%93%20CenkAir%20-%20MacBook%20Air/DREAMWEAVER/FOODAI/db/patch_addon_schema.sql)** - Complete idempotent implementation of all tables, RLS policies, and admin RPCs
3. **[db/patch_admin_analytics.sql](file:///Users/cenkyakinlar/Documents/Dokumentit%20%E2%80%93%20CenkAir%20-%20MacBook%20Air/DREAMWEAVER/FOODAI/db/patch_admin_analytics.sql)** - Updated with admin_click_summary function

## Applying the Schema

To apply the addon schema to your Supabase database:

1. Run the updated [schema.sql](file:///Users/cenkyakinlar/Documents/Dokumentit%20%E2%80%93%20CenkAir%20-%20MacBook%20Air/DREAMWEAVER/FOODAI/db/schema.sql) file in the Supabase SQL editor
2. Run [patch_addon_schema.sql](file:///Users/cenkyakinlar/Documents/Dokumentit%20%E2%80%93%20CenkAir%20-%20MacBook%20Air/DREAMWEAVER/FOODAI/db/patch_addon_schema.sql) in the Supabase SQL editor
3. Run [patch_admin_analytics.sql](file:///Users/cenkyakinlar/Documents/Dokumentit%20%E2%80%93%20CenkAir%20-%20MacBook%20Air/DREAMWEAVER/FOODAI/db/patch_admin_analytics.sql) in the Supabase SQL editor

## Key Features

### Clickouts Table
- Tracks all user clicks on offers
- Stores user ID, IP, user agent, and referer information
- Open insert policy for anonymous and authenticated users
- Read policy allows access to all clickouts

### Commissions Table
- Tracks commissions from conversions
- Links to clickouts, offers, and providers
- Status tracking (pending, approved, canceled)
- Unique constraint on provider and external conversion ID

### Profiles Table
- Extended with `is_admin` boolean field for admin access control
- Maintains reference to auth.users with cascade delete
- RLS policies for users to read and update their own profiles

### Favorites Table
- Many-to-many relationship between users and offers
- Composite primary key on user_id and offer_id
- RLS policies for users to manage their own favorites

### Alerts Table
- User-configured alerts for specific offer criteria
- Supports filtering by city, cuisine, discount, and price
- Boolean flags for pickup and delivery preferences
- RLS policies for users to manage their own alerts

### Admin RPCs
- `admin_click_summary()` - Returns count of clicks in the last 7 days
- `admin_clicks_by_provider()` - Returns click counts by provider for the last 30 days
- `admin_clicks_by_city()` - Returns click counts by city for the last 30 days
- `admin_revenue_30d()` - Returns daily revenue for the last 30 days

All functions are implemented with `security definer` to allow access to admin users with appropriate permissions.

## Idempotency

All schema definitions use `if not exists` checks and conditional policy creation to ensure idempotent execution. This allows the schema to be safely applied multiple times without causing errors or duplicate entries.