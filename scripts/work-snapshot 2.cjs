#!/usr/bin/env node
const { execSync } = require("node:child_process");

console.log("⟲ Mevcut .work -> .template (şablon güncelleniyor) ...");
try { execSync("chflags -R nouchg .template"); } catch {}
execSync(`rsync -a --delete \
  --exclude '.git' --exclude '.next' --exclude 'node_modules' \
  .work/ .template/`, { stdio: "inherit" });
try { execSync("chflags -R uchg .template"); } catch {}
console.log("✓ Şablon güncellendi (artık kalıcı).");