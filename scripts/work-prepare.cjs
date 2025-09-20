#!/usr/bin/env node
const { execSync } = require("node:child_process");
const fs = require("fs");
const path = require("path");

if (!fs.existsSync(".template")) {
  console.error("❌ .template yok. Önce şablon oluşturun.");
  process.exit(1);
}

if (!fs.existsSync(".work")) fs.mkdirSync(".work");

console.log("⟲ .work, .template'tan tam kopyalanıyor...");
execSync(`rsync -a --delete \
  --exclude '.git' --exclude '.next' --exclude 'node_modules' \
  .template/ .work/`, { stdio: "inherit" });

// .env.local dosyasını kopyala (yoksa)
const envSrc = path.join(".template",".env.local.example");
const envDst = path.join(".work",".env.local");
if (fs.existsSync(envSrc) && !fs.existsSync(envDst)) {
  fs.copyFileSync(envSrc, envDst);
  console.log("✓ .work/.env.local örnekten kopyalandı");
}

console.log("✓ .work hazır (TÜM özelliklerle). Artık .work içinde çalışın.");