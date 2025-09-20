const { execSync } = require("node:child_process");
try { execSync('pkill -f "next dev"'); } catch {}
for (let p = 3001; p <= 3009; p++) {
  try { execSync(`lsof -ti:${p} | xargs kill -9`); } catch {}
}
console.log("✓ Node/port temizliği tamam.");