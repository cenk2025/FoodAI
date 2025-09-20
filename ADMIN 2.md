# Admin Functionality Setup and Usage

## Database Setup

1. Run the SQL migration to add the `is_admin` flag to profiles:
   ```sql
   alter table profiles add column if not exists is_admin boolean default false;
   create index if not exists idx_profiles_admin on profiles(is_admin);
   ```

2. Run the SQL function for admin stats:
   ```sql
   create or replace function admin_click_summary()
   returns table(cnt bigint) language sql security definer as $$
     select count(*)::bigint from clickouts where at >= now() - interval '7 days'
   $$;
   ```

## Setting up an Admin User

To make a user an admin, you need to manually update their profile in the database:
```sql
UPDATE profiles SET is_admin = true WHERE id = 'USER_ID';
```

## Testing the Admin Functionality

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Sign in as a user who has been granted admin privileges

3. Navigate to `/admin` - you should see the admin dashboard

4. To test the CSV import:
   - Go to `/admin/commissions/import`
   - Upload the sample CSV file from `/public/sample-commissions.csv`
   - The data should be imported into the commissions table

## API Route

The CSV import functionality is handled by the API route at `/api/admin/commissions/import`.

## Security Notes

- Only users with `is_admin = true` can access admin routes
- The CSV import uses the Supabase service role for database operations
- All admin routes are protected by both authentication and authorization checks