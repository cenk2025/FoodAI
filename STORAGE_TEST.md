# Storage Test Procedure

## Prerequisites
1. Run the SQL script in `sql/storage_offer_images.sql` in Supabase SQL Editor
2. Ensure your user account has `is_admin = true` in the profiles table

## Test Steps

1. Navigate to the admin dashboard
2. Find an offer editor that uses the ImageUploader component
3. Select an image file to upload
4. Verify the upload succeeds and returns a public URL
5. Check that the image is visible in the Supabase Storage dashboard
6. Verify that non-admin users can view the image (public read policy)
7. Verify that non-admin users cannot upload images (admin write policy)

## Expected Results

- Admin users can successfully upload images
- Image URLs are publicly accessible
- Non-admin users cannot upload, update, or delete images
- File size limits are enforced (5MB)
- Only images with proper extensions are accepted