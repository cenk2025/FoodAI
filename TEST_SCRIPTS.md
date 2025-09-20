# Test Scripts

This directory contains various test scripts for different components of the application.

## Webhook Testing

### Comprehensive Webhook Test Script
- **File**: [scripts/test-commissions-webhook.sh](file:///Users/cenkyakinlar/Documents/Dokumentit%20–%20CenkAir%20-%20MacBook%20Air/DREAMWEAVER/FOODAI/scripts/test-commissions-webhook.sh)
- **Purpose**: Tests the commissions webhook endpoint with multiple scenarios
- **Usage**: 
  ```bash
  ./scripts/test-commissions-webhook.sh [endpoint] [secret]
  ```
- **Features**:
  - Tests valid requests
  - Tests invalid signatures
  - Tests missing signatures
  - Tests non-existent providers
  - Color-coded output for easy interpretation

### Node.js Webhook Test Script
- **File**: [scripts/test-webhook.js](file:///Users/cenkyakinlar/Documents/Dokumentit%20–%20CenkAir%20-%20MacBook%20Air/DREAMWEAVER/FOODAI/scripts/test-webhook.js)
- **Purpose**: Simple Node.js script to send a sample webhook request
- **Usage**: 
  ```bash
  node scripts/test-webhook.js
  ```

## Auth Callback Testing

### Node.js Auth Callback Test Script
- **File**: [scripts/test-auth-callback.js](file:///Users/cenkyakinlar/Documents/Dokumentit%20–%20CenkAir%20-%20MacBook%20Air/DREAMWEAVER/FOODAI/scripts/test-auth-callback.js)
- **Purpose**: Simple Node.js script to verify the auth callback page can be imported
- **Usage**: 
  ```bash
  node scripts/test-auth-callback.js
  ```

## Password Reset Testing

### Node.js Password Reset Test Script
- **File**: [scripts/test-password-reset.js](file:///Users/cenkyakinlar/Documents/Dokumentit%20–%20CenkAir%20-%20MacBook%20Air/DREAMWEAVER/FOODAI/scripts/test-password-reset.js)
- **Purpose**: Simple Node.js script to verify the password reset pages can be imported
- **Usage**: 
  ```bash
  node scripts/test-password-reset.js
  ```

## Running Tests

Make sure to make the shell scripts executable:
```bash
chmod +x scripts/*.sh
```

## Environment Variables

Some scripts may require environment variables to be set:
```bash
export COMMISSIONS_WEBHOOK_SECRET=your_test_secret
export WEBHOOK_URL=http://localhost:3000/api/webhooks/commissions
```