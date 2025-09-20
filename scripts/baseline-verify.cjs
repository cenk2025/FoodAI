#!/usr/bin/env node
const fs = require("fs");
const manifest = JSON.parse(fs.readFileSync(".template/.golden-manifest.json","utf8"));
const missing = manifest.mustExist.filter(p => !fs.existsSync(`.work/${p}`));
if (missing.length) {
  console.error("❌ Eksik dosyalar (özellik kırıldı):\n" + missing.map(x=>" - "+x).join("\n"));
  process.exit(1);
}
console.log("✓ Özellik doğrulaması geçti (tüm kritik dosyalar yerinde).");