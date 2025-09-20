# Supabase Configuration

## Overview

This document explains how to configure your Supabase database connection for the FoodAI application.

## Environment Variables

The application requires the following Supabase environment variables:

### Required Variables

1. `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous API key
3. `SUPABASE_SERVICE_ROLE` - Your Supabase service role key (keep secret!)

### How to Get Your Keys

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Find the following information:
   - Project URL (under "Configuration")
   - `anon` key (under "Project API keys")
   - `service_role` key (under "Project API keys")

### Security Notes

- The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe to expose to the client as it's designed for anonymous access
- The `SUPABASE_SERVICE_ROLE` key should NEVER be exposed to the client as it has full access to your database
- The service role key is used server-side only for operations requiring elevated privileges

## Database Connection

The application uses two different Supabase clients:

1. **Client-side client**: Uses the anon key for limited database access
2. **Server-side client**: Uses the service role key for full database access

## Connection String

For direct database connections (e.g., for database tools), use the following format:

```
postgresql://postgres.[project-ref]:[password]@aws-1-[region].pooler.supabase.com:6543/postgres
```

Replace:
- `[project-ref]` with your project reference (wpkcawjvhnaykqjgcgye)
- `[password]` with your database password
- `[region]` with your project region (eu-north-1)

## Testing the Connection

To verify your configuration is correct:

1. Ensure all environment variables are set in your `.env.local` file
2. Run the development server: `npm run dev`
3. Check the console for any Supabase connection errors

## Troubleshooting

### Common Issues

1. **Connection refused**: Verify your project URL is correct
2. **Authentication failed**: Check that your API keys are correct
3. **Permission denied**: Ensure you're using the service role key for server operations

### Getting Help

If you're having trouble with your Supabase configuration:
1. Check the Supabase documentation: https://supabase.com/docs
2. Review your project settings in the Supabase dashboard
3. Ensure your database is not paused (check in the dashboard)