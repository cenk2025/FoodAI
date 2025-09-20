import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
const file = resolve('app/globals.css');
if (!existsSync(file)) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`, 'utf8');
  console.log('Created app/globals.css');
}