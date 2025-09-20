# SEO Setup

## Overview
This document describes the SEO functionality implemented for the application, including robots.txt and sitemap generation.

## Components

### Robots.txt
- **Location**: [app/robots.txt/route.ts](file:///Users/cenkyakinlar/Documents/Dokumentit%20–%20CenkAir%20-%20MacBook%20Air/DREAMWEAVER/FOODAI/app/robots.txt/route.ts)
- **URL**: `/robots.txt`
- **Function**: Provides instructions to web crawlers about which pages to index
- **Features**:
  - Allows all user agents to crawl the site
  - Specifies the location of the sitemap
  - Uses the NEXT_PUBLIC_SITE_URL environment variable for the sitemap URL

### Sitemap
- **Location**: [app/sitemap.ts](file:///Users/cenkyakinlar/Documents/Dokumentit%20–%20CenkAir%20-%20MacBook%20Air/DREAMWEAVER/FOODAI/app/sitemap.ts)
- **URL**: `/sitemap.xml`
- **Function**: Provides a list of pages for search engines to crawl
- **Features**:
  - Includes core pages (home, offers, nearby)
  - Dynamically includes top cities from the database
  - Uses the NEXT_PUBLIC_SITE_URL environment variable for base URLs
  - Provides last modified timestamps

## Core Pages Included
1. Home page (`/`)
2. Offers page (`/offers`)
3. Nearby page (`/nearby`)

## Dynamic City Pages
The sitemap dynamically includes the top 15 cities from the offers database, formatted as:
- `/offers?city=Helsinki`
- `/offers?city=Tampere`
- etc.

## Environment Variables
- `NEXT_PUBLIC_SITE_URL`: Base URL for the site (e.g., https://example.com)

## Testing
To test the SEO functionality:

1. Visit `/robots.txt` to verify the robots.txt content
2. Visit `/sitemap.xml` to verify the sitemap content
3. Check that the sitemap includes core pages and city pages
4. Verify that URLs use the correct base URL from environment variables

## Deployment
The SEO functionality is automatically available when the application is deployed. Ensure that:
1. The `NEXT_PUBLIC_SITE_URL` environment variable is set correctly
2. The application is accessible at the specified URL
3. Search engines can access both `/robots.txt` and `/sitemap.xml`