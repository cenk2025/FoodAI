#!/usr/bin/env node
const { spawn } = require("node:child_process");
const net = require("node:net");

const start = 3001, end = 3009;
function findFreePort(i = start) {
  return new Promise(res => {
    if (i > end) return res(null);
    const srv = net.createServer();
    srv.once("error", () => res(findFreePort(i + 1)));
    srv.listen(i, () => { srv.close(() => res(i)); });
  });
}
(async () => {
  const port = await findFreePort();
  if (!port) { console.error("UYGUN PORT YOK (3001-3009)."); process.exit(1); }
  process.env.PORT = String(port);
  console.log(`▶︎ Dev başlıyor: http://localhost:${port}`);
  const ps = spawn(process.platform === "win32" ? "npm.cmd" : "npm",
    ["run", "dev:fast"], { stdio: "inherit", env: process.env });
  ps.on("exit", code => process.exit(code ?? 0));
})();