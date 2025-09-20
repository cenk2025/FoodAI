const fi = require('./i18n/messages/fi.json');
const en = require('./i18n/messages/en.json');

console.log('Finnish messages:');
console.log(JSON.stringify(fi, null, 2));

console.log('\nEnglish messages:');
console.log(JSON.stringify(en, null, 2));

// Check if any keys contain dots
function checkForDots(obj, prefix = '') {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      checkForDots(value, fullKey);
    } else {
      if (fullKey.includes('.')) {
        console.log(`Found key with dot: ${fullKey}`);
      }
    }
  }
}

console.log('\nChecking for keys with dots in Finnish messages:');
checkForDots(fi);

console.log('\nChecking for keys with dots in English messages:');
checkForDots(en);