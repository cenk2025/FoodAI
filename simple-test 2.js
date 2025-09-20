const fs = require('fs');

// Read the file directly
const content = fs.readFileSync('i18n/messages/fi.json', 'utf8');
console.log('File content:');
console.log(content);

// Parse and check
const obj = JSON.parse(content);
console.log('\nParsed object:');
console.log(JSON.stringify(obj, null, 2));

// Check for flat keys
function hasFlatKeys(obj, path = '') {
  for (const [key, value] of Object.entries(obj)) {
    const fullPath = path ? `${path}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      if (hasFlatKeys(value, fullPath)) return true;
    } else {
      // This is a leaf node
      if (fullPath.includes('.')) {
        console.log(`Found flat key: ${fullPath}`);
        return true;
      }
    }
  }
  return false;
}

console.log('\nChecking for flat keys:');
const hasFlat = hasFlatKeys(obj);
console.log(`Has flat keys: ${hasFlat}`);