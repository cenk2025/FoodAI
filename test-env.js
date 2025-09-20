const fs = require('fs');
const path = require('path');

// Load env vars
const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

console.log('Environment file content:');
console.log(envContent);
console.log('---');

// Parse env vars
const envVars = {};
envContent.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    envVars[key] = value;
  }
});

console.log('Parsed environment variables:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', envVars.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY ? `${envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` : 'undefined');

// Test URL validity
try {
  const url = new URL(envVars.NEXT_PUBLIC_SUPABASE_URL);
  console.log('URL is valid:', url.href);
} catch (error) {
  console.log('URL is invalid:', error.message);
}