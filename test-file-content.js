const fs = require('fs');
const path = require('path');

const fiPath = path.join(__dirname, 'i18n', 'messages', 'fi.json');
console.log('File path:', fiPath);

const content = fs.readFileSync(fiPath, 'utf8');
console.log('File content:');
console.log(content);

const parsed = JSON.parse(content);
console.log('Parsed section.featured:', parsed.section.featured);