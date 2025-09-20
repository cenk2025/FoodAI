// scripts/build-ftp.mjs
import {execSync} from 'node:child_process';
import {mkdirSync, rmSync, cpSync, writeFileSync, existsSync, readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const ROOT = resolve('.');
const OUT = resolve('deploy/ftp');

function sh(cmd) {
  console.log('> ' + cmd);
  execSync(cmd, {stdio: 'inherit', env: process.env});
}

// 1) Temizle ve build et
rmSync(OUT, {recursive: true, force: true});
sh('next build'); // next.config.js -> output: 'standalone'

// 2) klasörü oluştur
mkdirSync(OUT, {recursive: true});

// 3) standalone server ve static'i kopyala
cpSync(resolve('.next/standalone'), OUT, {recursive: true});
mkdirSync(resolve(OUT, '.next'), {recursive: true});
cpSync(resolve('.next/static'), resolve(OUT, '.next/static'), {recursive: true});

// 4) public ve gerekli runtime dosyaları
if (existsSync('public')) cpSync('public', resolve(OUT, 'public'), {recursive: true});

// i18n mesajları runtime'da okunuyorsa ekle
if (existsSync('i18n/messages')) {
  mkdirSync(resolve(OUT, 'i18n'), {recursive: true});
  cpSync('i18n/messages', resolve(OUT, 'i18n/messages'), {recursive: true});
}

// 5) production package.json (sadece çalıştırma için)
const pkg = JSON.parse(readFileSync('package.json','utf8'));
const runPkg = {
  name: pkg.name || 'foodai',
  private: true,
  type: 'module',
  engines: pkg.engines,
  dependencies: {
    // next standalone server Node ile çalışır, bu bağımlılıklar yeterlidir
    "next": pkg.dependencies.next,
    "react": pkg.dependencies.react,
    "react-dom": pkg.dependencies["react-dom"]
  },
  scripts: {
    "start": "node server.js"
  }
};
writeFileSync(resolve(OUT, 'package.json'), JSON.stringify(runPkg, null, 2));

// 6) server entry (Next standalone server.js)
const serverJs = `
// Minimal runner for Next standalone
process.env.PORT = process.env.PORT || process.env.APP_PORT || "3000";
process.env.HOST = process.env.HOST || "0.0.0.0";
console.log("[FoodAi] starting Next standalone on", process.env.HOST+":"+process.env.PORT);

// env loader (opsiyonel): .env.production varsa yükle
import fs from 'node:fs';
import path from 'node:path';
const envFile = path.resolve('.env.production');
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile,'utf8').split(/\\r?\\n/).filter(Boolean);
  for (const line of lines) {
    const i = line.indexOf('=');
    if (i>0) {
      const k = line.slice(0,i).trim(); const v = line.slice(i+1).trim();
      if (!process.env[k]) process.env[k]=v;
    }
  }
}

import("./server.js"); // this exists inside .next/standalone
`;
writeFileSync(resolve(OUT, 'server.js'), serverJs);

// 7) bilgi notu
writeFileSync(resolve(OUT, 'README_DEPLOY.txt'), `
FoodAi FTP Deploy (standalone)
==============================

Çalıştırma:
1) Sunucuda bu klasöre girin:
   cd /path/to/deploy/ftp
2) .env.production dosyasını oluşturun (aşağıya bakınız)
3) npm ci --omit=dev   (veya: npm i --production)
4) PORT=3000 node server.js

Gerekli ENV (örnek):
NEXT_PUBLIC_SITE_URL=https://foodai.fi
NEXT_PUBLIC_SUPABASE_URL=https://wpkcawjvhnaykqjgcgye.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=***ANON***
SUPABASE_SERVICE_ROLE=***SERVICE_ROLE***   # sadece serverda kullanılır
DEEPSEEK_API_KEY=***DEEPSEEK***

Notlar:
- Supabase Auth redirect URL'lerini üretim domainine göre ayarlayın.
- Görsel optimizasyonu unoptimized modda. CDN üzerinden resimler çalışır.
`);

// 8) done
console.log(`\n✅ FTP paketi hazır: ${OUT}\n`);