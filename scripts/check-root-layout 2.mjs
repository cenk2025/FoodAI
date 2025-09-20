import { readFileSync } from 'fs';

function mustContain(file, substrings) {
  const s = readFileSync(file, 'utf8');
  for (const sub of substrings) if (!s.includes(sub)) return false;
  return true;
}
function mustNotContain(file, substrings) {
  const s = readFileSync(file, 'utf8');
  for (const sub of substrings) if (s.includes(sub)) return false;
  return true;
}

let ok = true;

// Root: must have html & body
if (!mustContain('app/layout.tsx', ['<html', '<body'])) {
  console.error('❌ app/layout.tsx must contain <html> and <body>.');
  ok = false;
}

// Locale: must NOT have html/body or global css import
try {
  if (!mustNotContain('app/[locale]/layout.tsx', ['<html', '<body', "globals.css"])) {
    console.error('❌ app/[locale]/layout.tsx must NOT include <html>/<body> or import globals.css.');
    ok = false;
  }
} catch { /* file might not exist; ignore */ }

if (!ok) process.exit(1);
console.log('✅ Root/Locale layout structure OK');