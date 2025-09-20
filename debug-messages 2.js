const fs = require('fs');
const path = require('path');

// Simulate what the request.ts file is doing
async function loadMessages(locale) {
  const filePath = path.join(__dirname, 'i18n', 'messages', `${locale}.json`);
  console.log('File path:', filePath);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log('File does not exist');
    return null;
  }
  
  const fileContent = fs.readFileSync(filePath, 'utf8');
  console.log('File content:');
  console.log(fileContent);
  
  const messages = JSON.parse(fileContent);
  console.log('Parsed section.featured:', messages.section.featured);
  
  return messages;
}

// Test with Finnish locale
loadMessages('fi').catch(console.error);