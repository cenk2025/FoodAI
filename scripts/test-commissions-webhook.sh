#!/bin/bash

# Test script for commissions webhook with HMAC-SHA256 signature verification
# Usage: ./scripts/test-commissions-webhook.sh [endpoint] [secret]

# Configuration
ENDPOINT=${1:-"http://localhost:3000/api/webhooks/commissions"}
SECRET=${2:-"yoursecret"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Testing Commissions Webhook Endpoint${NC}"
echo "Endpoint: $ENDPOINT"
echo "Secret: $SECRET"
echo

# Test 1: Valid request
echo -e "${YELLOW}Test 1: Valid request${NC}"
BODY='{"provider_slug":"wolt","conversion_id":"abc123","commission_amount":1.23,"status":"approved"}'
SIG=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$SECRET" -r | awk '{print $1}')

echo "Sending payload: $BODY"
echo "Generated signature: $SIG"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$ENDPOINT" \
  -H "x-signature: sha256=$SIG" \
  -H "Content-Type: application/json" \
  -d "$BODY")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✓ Test 1 PASSED${NC} (HTTP $HTTP_CODE)"
else
  echo -e "${RED}✗ Test 1 FAILED${NC} (HTTP $HTTP_CODE): $RESPONSE_BODY"
fi
echo

# Test 2: Invalid signature
echo -e "${YELLOW}Test 2: Invalid signature${NC}"
BODY='{"provider_slug":"wolt","conversion_id":"def456","commission_amount":2.34,"status":"pending"}'
SIG="invalidsignature"

echo "Sending payload with invalid signature"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$ENDPOINT" \
  -H "x-signature: sha256=$SIG" \
  -H "Content-Type: application/json" \
  -d "$BODY")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" -eq 401 ]; then
  echo -e "${GREEN}✓ Test 2 PASSED${NC} (HTTP $HTTP_CODE - Unauthorized as expected)"
else
  echo -e "${RED}✗ Test 2 FAILED${NC} (HTTP $HTTP_CODE): $RESPONSE_BODY"
fi
echo

# Test 3: Missing signature
echo -e "${YELLOW}Test 3: Missing signature header${NC}"
BODY='{"provider_slug":"wolt","conversion_id":"ghi789","commission_amount":3.45,"status":"canceled"}'

echo "Sending payload without signature header"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "$BODY")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" -eq 401 ]; then
  echo -e "${GREEN}✓ Test 3 PASSED${NC} (HTTP $HTTP_CODE - Unauthorized as expected)"
else
  echo -e "${RED}✗ Test 3 FAILED${NC} (HTTP $HTTP_CODE): $RESPONSE_BODY"
fi
echo

# Test 4: Non-existent provider
echo -e "${YELLOW}Test 4: Non-existent provider${NC}"
BODY='{"provider_slug":"nonexistent","conversion_id":"jkl012","commission_amount":4.56,"status":"approved"}'
SIG=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$SECRET" -r | awk '{print $1}')

echo "Sending payload with non-existent provider"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$ENDPOINT" \
  -H "x-signature: sha256=$SIG" \
  -H "Content-Type: application/json" \
  -d "$BODY")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" -eq 400 ]; then
  echo -e "${GREEN}✓ Test 4 PASSED${NC} (HTTP $HTTP_CODE - Bad Request as expected)"
else
  echo -e "${RED}✗ Test 4 FAILED${NC} (HTTP $HTTP_CODE): $RESPONSE_BODY"
fi
echo

echo -e "${YELLOW}Test script completed${NC}"