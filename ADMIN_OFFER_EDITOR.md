# Admin Offer Editor

## Overview
This feature provides a simple interface for administrators to create new offers with all necessary details including image uploads.

## Components

1. **Admin Offer Editor Page** ([app/admin/offers/new/page.tsx](file:///Users/cenkyakinlar/Documents/Dokumentit%20–%20CenkAir%20-%20MacBook%20Air/DREAMWEAVER/FOODAI/app/admin/offers/new/page.tsx))
   - Server-side rendered form with provider dropdown
   - Image uploader component integration
   - Form validation for required fields
   - Protected by admin route guard

2. **API Route** ([app/api/admin/offers/route.ts](file:///Users/cenkyakinlar/Documents/Dokumentit%20–%20CenkAir%20-%20MacBook%20Air/DREAMWEAVER/FOODAI/app/api/admin/offers/route.ts))
   - Handles form submission via POST
   - Validates and sanitizes input data
   - Inserts new offer using Supabase service role
   - Redirects back to admin dashboard on success

## Features

- Provider selection dropdown populated from database
- Image upload via ImageUploader component
- Form validation for required fields
- Data sanitization and length limits
- Automatic redirection after successful creation
- Error handling with user-friendly messages
- Route protection (admin-only access)

## Usage

1. Navigate to `/admin/offers/new` as an admin user
2. Select a provider from the dropdown
3. Fill in offer details (title, prices, city, deep link)
4. Upload an image using the ImageUploader component or enter a URL directly
5. Click "Create" to submit the form
6. You will be redirected to the admin dashboard upon success

## Data Validation

- Title: Max 200 characters
- Original Price: Optional number with 2 decimal places
- Discounted Price: Required number with 2 decimal places
- City: Max 80 characters
- Deep Link: Max 1024 characters
- Image URL: Max 1024 characters
- Status: Automatically set to 'active'

## Security

- Route is protected by admin guard, ensuring only administrators can access
- Form submission uses service role for database operations
- Input data is sanitized and validated
- No client-side bypass possible due to server-side protection