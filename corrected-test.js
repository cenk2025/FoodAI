const fs = require('fs');

// Read the file directly
const content = fs.readFileSync('i18n/messages/fi.json', 'utf8');
console.log('File content:');
console.log(content);

// Parse and check
const obj = JSON.parse(content);
console.log('\nParsed object:');
console.log(JSON.stringify(obj, null, 2));

// Correct function to check for flat keys
// This function should only check if the actual keys in the objects contain dots
function hasFlatKeys(obj, path = '') {
  for (const [key, value] of Object.entries(obj)) {
    // Check if the key itself contains a dot
    if (key.includes('.')) {
      console.log(`Found flat key at path "${path}": key "${key}" contains a dot`);
      return true;
    }
    
    // If the value is an object, recurse into it
    if (typeof value === 'object' && value !== null) {
      const newPath = path ? `${path}.${key}` : key;
      if (hasFlatKeys(value, newPath)) return true;
    }
  }
  return false;
}

console.log('\n=== CORRECTED CHECK ===');
const hasFlat = hasFlatKeys(obj);
console.log(`\nHas flat keys: ${hasFlat}`);

// Let's also manually verify some keys
console.log('\n=== MANUAL VERIFICATION ===');
console.log('Top level keys:', Object.keys(obj));
console.log('Search keys:', Object.keys(obj.search));
console.log('Nav keys:', Object.keys(obj.nav));
console.log('Auth keys:', Object.keys(obj.auth));
console.log('Auth.signin keys:', Object.keys(obj.auth.signin));
console.log('Home keys:', Object.keys(obj.home));
console.log('Home.chatbot keys:', Object.keys(obj.home.chatbot));