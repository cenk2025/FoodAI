import {readFileSync} from 'fs';
const fi = JSON.parse(readFileSync('i18n/messages/fi.json','utf8'));
const en = JSON.parse(readFileSync('i18n/messages/en.json','utf8'));
const keys = (obj,prefix='') => Object.entries(obj).flatMap(([k,v]) =>
  typeof v==='object' ? keys(v,`${prefix}${k}.`) : [`${prefix}${k}`]);
const a = new Set(keys(fi)), b = new Set(keys(en));
const missingInEn = [...a].filter(k=>!b.has(k));
const missingInFi = [...b].filter(k=>!a.has(k));
if (missingInEn.length || missingInFi.length) {
  console.error('❌ i18n key mismatch');
  if (missingInEn.length) console.error('Missing in en:', missingInEn);
  if (missingInFi.length) console.error('Missing in fi:', missingInFi);
  process.exit(1);
} else {
  console.log('✅ i18n keys match between fi and en');
}