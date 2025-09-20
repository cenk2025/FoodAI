# Testing Admin Functionality

## Prerequisites

1. Ensure you have run the database migrations to add the `is_admin` column to the profiles table
2. Have at least one user account with `is_admin` set to `true`

## Manual Testing Steps

### 1. Test Admin Access Protection

1. Sign in as a regular user (without admin privileges)
2. Try to navigate to `/admin`
3. You should be redirected to `/dashboard`

### 2. Test Admin Dashboard

1. Sign in as an admin user
2. Navigate to `/admin`
3. You should see the admin dashboard with:
   - Click count for the last 7 days
   - Approved commission total
   - Import CSV button

### 3. Test CSV Import Functionality

1. As an admin user, go to `/admin/commissions/import`
2. Download the sample CSV file
3. Upload the sample CSV file
4. You should be redirected to `/admin` with a success message
5. The commission data should appear in the database

## Addon Schema Testing

The addon schema includes tests for:
- Clickouts functionality
- Commissions tracking
- Favorites management
- Alerts configuration
- Admin RPC functions

## Automated Testing

Run the test suite with:
```bash
npm run test
```

## Test Data

A sample CSV file is available at `/public/sample-commissions.csv` for testing the import functionality.

## Troubleshooting

### If you get permission errors:

1. Ensure the user has `is_admin` set to `true` in the database
2. Check that the Supabase service role key is correctly configured in environment variables

### If the CSV import fails:

1. Verify the CSV format matches the expected columns
2. Check the server logs for detailed error messages
3. Ensure the Supabase service role has write permissions to the commissions table