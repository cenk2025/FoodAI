// Test script for commissions webhook
// Usage: node scripts/test-webhook.js

const crypto = require('crypto');

// Configuration
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/api/webhooks/commissions';
const SECRET = process.env.COMMISSIONS_WEBHOOK_SECRET || 'test_secret';

// Sample payload
const payload = {
  provider_slug: 'wolt',
  conversion_id: 'test_' + Date.now(),
  gross_amount: 10.50,
  commission_amount: 1.05,
  currency: 'EUR',
  status: 'approved',
  occurred_at: new Date().toISOString()
};

// Generate signature
const payloadString = JSON.stringify(payload);
const signature = crypto.createHmac('sha256', SECRET).update(payloadString).digest('hex');

// Send request
fetch(WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-signature': `sha256=${signature}`
  },
  body: payloadString
})
.then(response => response.json())
.then(data => {
  console.log('Response:', data);
})
.catch(error => {
  console.error('Error:', error);
});