#!/usr/bin/env node
const { execSync } = require("node:child_process");

console.log("⟲ .work sıfırlanıyor (şablondan) ...");
execSync(`rsync -a --delete \
  --exclude '.git' --exclude '.next' --exclude 'node_modules' \
  .template/ .work/`, { stdio: "inherit" });
console.log("✓ .work sıfırlandı.");