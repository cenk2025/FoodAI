# SEO Testing

## Overview
This document describes how to test the SEO functionality including robots.txt and sitemap generation.

## Testing Robots.txt

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit http://localhost:3000/robots.txt

3. Verify the content includes:
   ```
   User-agent: *
   Allow: /
   Sitemap: http://localhost:3000/sitemap.xml
   ```

4. If deployed, check the production URL:
   ```
   https://your-domain.com/robots.txt
   ```

## Testing Sitemap

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit http://localhost:3000/sitemap.xml

3. Verify the sitemap includes:
   - Core pages: home, offers, nearby
   - Top cities from the database (up to 15)
   - Proper XML formatting
   - Last modified timestamps

4. Check that:
   - URLs use the correct base URL
   - City names are properly URL encoded
   - Duplicate cities are removed
   - Only non-null cities are included

## Using the Test Script

Run the test script to verify the sitemap module can be imported:

```bash
node scripts/test-sitemap.js
```

## Environment Variables

Ensure the following environment variables are set:
- `NEXT_PUBLIC_SITE_URL`: Base URL for the site

For local testing, you can add to your `.env.local`:
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Manual Verification

1. Check that robots.txt points to the correct sitemap location
2. Verify sitemap.xml is accessible and well-formed
3. Confirm core pages are included in the sitemap
4. Check that city pages are dynamically generated
5. Verify last modified dates are present

## Production Deployment

When deploying to production:

1. Update `NEXT_PUBLIC_SITE_URL` to your production domain
2. Verify both robots.txt and sitemap.xml are accessible
3. Submit sitemap to search engines (Google Search Console, etc.)
4. Monitor crawl errors in search console

## Common Issues

1. **Missing Environment Variable**: If NEXT_PUBLIC_SITE_URL is not set, URLs will default to http://localhost:3000
2. **Database Connection**: Sitemap generation requires database access to fetch cities
3. **CORS Issues**: Ensure the site is accessible to search engine crawlers
4. **Performance**: Sitemap generation queries the database; ensure it performs well under load