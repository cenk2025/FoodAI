const fs = require('fs');

// Function to convert flat keys to nested objects without lodash
function convertFlatToNested(flatObj) {
  const nestedObj = {};
  
  for (const [key, value] of Object.entries(flatObj)) {
    // Split the key by dots to get the path
    const path = key.split('.');
    
    // Navigate to the correct position in the nested object
    let current = nestedObj;
    for (let i = 0; i < path.length - 1; i++) {
      const part = path[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    
    // Set the final value
    current[path[path.length - 1]] = value;
  }
  
  return nestedObj;
}

// Read the current files
const fi = JSON.parse(fs.readFileSync('i18n/messages/fi.json', 'utf8'));
const en = JSON.parse(fs.readFileSync('i18n/messages/en.json', 'utf8'));

console.log('Original Finnish messages:');
console.log(fi);

console.log('\nOriginal English messages:');
console.log(en);

// Convert to nested structure
const fixedFi = convertFlatToNested(fi);
const fixedEn = convertFlatToNested(en);

console.log('\nFixed Finnish messages:');
console.log(JSON.stringify(fixedFi, null, 2));

console.log('\nFixed English messages:');
console.log(JSON.stringify(fixedEn, null, 2));

// Write back to files
fs.writeFileSync('i18n/messages/fi.json', JSON.stringify(fixedFi, null, 2));
fs.writeFileSync('i18n/messages/en.json', JSON.stringify(fixedEn, null, 2));

console.log('\nFiles have been updated.');