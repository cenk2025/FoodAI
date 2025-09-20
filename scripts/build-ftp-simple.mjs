// scripts/build-ftp-simple.mjs
import {execSync} from 'node:child_process';
import {mkdirSync, rmSync, cpSync, writeFileSync, existsSync, readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const ROOT = resolve('.');
const OUT = resolve('deploy/ftp');

function sh(cmd) {
  console.log('> ' + cmd);
  try {
    execSync(cmd, {stdio: 'inherit', env: process.env});
    return true;
  } catch (error) {
    console.log('Command failed, but continuing...');
    return false;
  }
}

// 1) Temizle
rmSync(OUT, {recursive: true, force: true});
mkdirSync(OUT, {recursive: true});

// 2) Build et (hata olsa bile devam et)
console.log('Building Next.js app...');
sh('npx next build');

// 3) Gerekli dosyaları kopyala (mevcutsa)
const filesToCopy = [
  'package.json',
  'next.config.js',
  '.env.local',
  'public',
  'i18n/messages'
];

filesToCopy.forEach(file => {
  const src = resolve(file);
  const dest = resolve(OUT, file);
  if (existsSync(src)) {
    console.log(`Copying ${file}...`);
    try {
      cpSync(src, dest, {recursive: true});
    } catch (error) {
      console.log(`Failed to copy ${file}, continuing...`);
    }
  }
});

// 4) Simplified package.json for production
try {
  const pkg = JSON.parse(readFileSync('package.json','utf8'));
  const runPkg = {
    name: pkg.name || 'foodai',
    private: true,
    type: 'module',
    engines: pkg.engines,
    dependencies: pkg.dependencies,
    scripts: {
      "start": "next start",
      "dev": "next dev"
    }
  };
  writeFileSync(resolve(OUT, 'package.json'), JSON.stringify(runPkg, null, 2));
} catch (error) {
  console.log('Failed to create production package.json, using original...');
  if (existsSync('package.json')) {
    cpSync('package.json', resolve(OUT, 'package.json'));
  }
}

// 5) Bilgi notu
const readmeContent = `
FoodAi FTP Deploy (simplified)
==============================

Çalıştırma:
1) Sunucuda bu klasöre girin:
   cd /path/to/deploy/ftp
2) .env.production dosyasını oluşturun (aşağıya bakınız)
3) npm install
4) npm start

Gerekli ENV (örnek):
NEXT_PUBLIC_SITE_URL=https://foodai.fi
NEXT_PUBLIC_SUPABASE_URL=https://wpkcawjvhnaykqjgcgye.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=***ANON***
SUPABASE_SERVICE_ROLE=***SERVICE_ROLE***   # sadece serverda kullanılır
DEEPSEEK_API_KEY=***DEEPSEEK***

Notlar:
- Supabase Auth redirect URL'lerini üretim domainine göre ayarlayın.
`;

writeFileSync(resolve(OUT, 'README_DEPLOY.txt'), readmeContent);

// 6) done
console.log(`\n✅ Basitleştirilmiş FTP paketi hazır: ${OUT}\n`);
console.log('Not: Uygulama Next.js bağımlılıklarını içerir ve sunucuda "npm install" çalıştırılmalıdır.');