# Full-Text Search Implementation

## Overview
This document describes the implementation of full-text search functionality for offers using PostgreSQL's tsvector and GIN indexing.

## Database Changes

### SQL Patch
The SQL patch ([sql/patch_fulltext.sql](file:///Users/cenkyakinlar/Documents/Dokumentit%20–%20CenkAir%20-%20MacBook%20Air/DREAMWEAVER/FOODAI/sql/patch_fulltext.sql)) adds:

1. A generated `search_tsv` column to the `offers` table
2. A GIN index on the `search_tsv` column for efficient searching

The `search_tsv` column is automatically populated with a tsvector containing the title and description of each offer.

## Implementation Details

### Search Process
1. When a search query is provided (`q` parameter), the system:
   - Queries the `offers` table using `.textSearch()` on the `search_tsv` column
   - Uses `websearch` type for better handling of search terms
   - Limits results to 200 offers
   - Extracts the IDs of matching offers

2. The offer index query is then modified to:
   - Filter results by the extracted IDs using `.in()`
   - Apply other filters (city, cuisine, etc.) as usual
   - Handle empty results with a guard ID

### Benefits
- Improved search relevance using PostgreSQL's full-text search capabilities
- Better performance with GIN indexing
- Support for complex search queries (phrases, boolean operators)
- Separation of search logic from filtering logic

## Usage

### Applying the Database Changes
Run the SQL patch in your Supabase SQL editor:
```sql
-- Apply sql/patch_fulltext.sql
```

### Search Query Examples
The full-text search supports various query formats:
- Simple terms: `pizza`
- Multiple terms: `pizza burger`
- Phrases: `"italian pizza"`
- Exclusions: `pizza -burger`

## Performance Considerations

- The GIN index significantly improves search performance
- Limiting full-text results to 200 prevents excessive memory usage
- The two-step process (search IDs, then filter index) maintains efficiency
- The guard ID prevents issues when no results are found

## Testing

To test the full-text search:
1. Apply the SQL patch
2. Navigate to `/offers?q=searchterm`
3. Verify that results are relevant to the search term
4. Test with various search queries (single words, phrases, etc.)
5. Verify that other filters still work correctly