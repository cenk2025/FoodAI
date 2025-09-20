// scripts/check-shell.mjs
import { readFileSync } from 'fs';
function mustInclude(file, s){ return readFileSync(file,'utf8').includes(s); }
function mustNot(file, s){ return !readFileSync(file,'utf8').includes(s); }

let ok = true;
if (!mustInclude('app/[locale]/layout.tsx','<main')) { console.error('Missing <main> in locale layout'); ok=false; }
if (!mustInclude('app/[locale]/layout.tsx','LocaleShell')) { console.error('LocaleShell not used in locale layout'); ok=false; }
if (!mustNot('app/[locale]/layout.tsx','<html')) { console.error('Remove <html> from locale layout'); ok=false; }
if (!mustNot('app/[locale]/layout.tsx','globals.css')) { console.error('Do not import globals.css in locale layout'); ok=false; }
if (!mustInclude('app/layout.tsx','<html')) { console.error('Root layout must have <html>'); ok=false; }

if (!ok) process.exit(1); 
console.log('✅ Shell layout checks OK');