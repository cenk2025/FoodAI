-- Test queries for full-text search functionality

-- Test 1: Basic text search
SELECT id, title, search_tsv
FROM offers
WHERE search_tsv @@ websearch_to_tsquery('simple', 'burger');

-- Test 2: Phrase search
SELECT id, title, search_tsv
FROM offers
WHERE search_tsv @@ websearch_to_tsquery('simple', '"sushi setti"');

-- Test 3: Multiple terms
SELECT id, title, search_tsv
FROM offers
WHERE search_tsv @@ websearch_to_tsquery('simple', 'pizza burger');

-- Test 4: Exclusion
SELECT id, title, search_tsv
FROM offers
WHERE search_tsv @@ websearch_to_tsquery('simple', 'pizza -burger');

-- Test 5: Check ranking
SELECT id, title, ts_rank(search_tsv, websearch_to_tsquery('simple', 'burger')) as rank
FROM offers
WHERE search_tsv @@ websearch_to_tsquery('simple', 'burger')
ORDER BY rank DESC;