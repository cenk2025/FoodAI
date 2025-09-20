import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Function to recursively find files with specific extensions
function findFiles(dir, extensions, files = []) {
  const items = readdirSync(dir);
  for (const item of items) {
    // Skip node_modules and .next directories
    if (item === 'node_modules' || item === '.next' || item === '.git') continue;
    
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      findFiles(fullPath, extensions, files);
    } else {
      const ext = '.' + fullPath.split('.').pop();
      if (extensions.includes(ext)) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

// Find all JS/TS files
const files = findFiles('.', ['.js', '.jsx', '.ts', '.tsx']);

const bad = [];
for (const f of files) {
  try {
    const s = readFileSync(f, 'utf8');
    // Check for the old ../styles/globals.css import path
    if (s.match(/['"]\.\.\/styles\/globals\.css['"]/)) bad.push(f);
    // Also check for other incorrect paths
    if (s.match(/['"]\.\.\/globals\.css['"]/) && !s.match(/['"]\.\.\/styles\/globals\.css['"]/)) bad.push(f);
    if (s.match(/['"]styles\/globals\.css['"]/) && !s.match(/['"]\.\.\/styles\/globals\.css['"]/)) bad.push(f);
  } catch (error) {
    // Skip files that can't be read
  }
}

if (bad.length) {
  console.error('❌ Wrong globals.css import path in:');
  bad.forEach((f) => console.error(' - ' + f));
  console.error("Use: import '@/app/globals.css' (only in app/layout.tsx).");
  process.exit(1);
} else {
  console.log('✅ globals.css path OK');
}