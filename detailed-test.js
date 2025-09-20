const fs = require('fs');

// Read the file directly
const content = fs.readFileSync('i18n/messages/fi.json', 'utf8');
console.log('File content:');
console.log(content);

// Parse and check
const obj = JSON.parse(content);
console.log('\nParsed object:');
console.log(JSON.stringify(obj, null, 2));

// Check each level manually
console.log('\nTop level keys:');
console.log(Object.keys(obj));

console.log('\nSearch object:');
console.log(obj.search);
console.log('Search keys:');
console.log(Object.keys(obj.search));

console.log('\nNav object:');
console.log(obj.nav);
console.log('Nav keys:');
console.log(Object.keys(obj.nav));

// Check for flat keys with detailed tracing
function hasFlatKeys(obj, path = '') {
  console.log(`\nChecking object at path: "${path}"`);
  console.log(`Keys: [${Object.keys(obj).join(', ')}]`);
  
  for (const [key, value] of Object.entries(obj)) {
    const fullPath = path ? `${path}.${key}` : key;
    console.log(`  Key: "${key}", Full path: "${fullPath}", Type: ${typeof value}`);
    
    if (typeof value === 'object' && value !== null) {
      console.log(`    Recursing into object with key: "${key}"`);
      if (hasFlatKeys(value, fullPath)) return true;
    } else {
      // This is a leaf node
      if (fullPath.includes('.')) {
        console.log(`    *** Found flat key: ${fullPath}`);
        return true;
      } else {
        console.log(`    Leaf node: ${fullPath} = ${value}`);
      }
    }
  }
  return false;
}

console.log('\n=== DETAILED CHECK ===');
const hasFlat = hasFlatKeys(obj);
console.log(`\nHas flat keys: ${hasFlat}`);