import {execSync} from 'child_process';
import {readFileSync} from 'fs';

let files = [];
try {
  files = execSync('git ls-files "*.tsx" "*.ts" "*.jsx" "*.js"', {encoding:'utf8'}).trim().split('\n');
} catch (error) {
  console.warn('⚠️  Not in a git repository, skipping non-localized string check');
  process.exit(0);
}
const turkishHints = /(Öne çıkan|Tarjoukset →|Siirry|Kojelauta|Etusivu|Admin|Kirjaudu|Alennukset|Tarjoukset)/;

let bad = [];
for (const f of files) {
  const s = readFileSync(f,'utf8');
  if (turkishHints.test(s)) bad.push(f);
}
if (bad.length) {
  console.warn('⚠️  Non-localized hard-coded UI strings found:');
  bad.forEach(f=>console.warn(' - ' + f));
  console.warn('Move them into i18n/messages/*.json and use next-intl.');
}