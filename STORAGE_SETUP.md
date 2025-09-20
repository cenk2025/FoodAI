# Supabase Storage Setup for Offer Images

## Overview
This setup creates a public storage bucket for offer images with RLS policies that allow:
- Public read access to all images
- Admin-only write access (insert, update, delete)

## Setup Steps

1. Run the SQL script in Supabase SQL Editor:
   ```
   sql/storage_offer_images.sql
   ```

2. This creates:
   - A storage bucket named 'offer-images'
   - RLS policies for public read and admin-only write operations

## Features

- Public read access to all images
- Admin-only write access controlled by profiles.is_admin flag
- File size limit of 5MB per image
- API route for uploading images via service role
- Client-side image uploader component for admin use

## Usage

1. Admins can upload images through the ImageUploader component
2. Images are stored in the 'offer-images' bucket
3. Public URLs are generated for use in offer listings
4. All users can view images (public read policy)
5. Only admins can upload, update, or delete images (admin write policies)