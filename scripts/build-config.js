#!/usr/bin/env node
// Reads cap-try-on/.env and writes cap-try-on/config.js (gitignored).
const fs = require("fs");
const path = require("path");

const appDir = path.join(__dirname, "..", "cap-try-on");
const envPath = path.join(appDir, ".env");
const outPath = path.join(appDir, "config.js");

if (!fs.existsSync(envPath)) {
  console.error(`Missing ${envPath}. Copy cap-try-on/.env.example to cap-try-on/.env and fill in WEBHOOK_URL.`);
  process.exit(1);
}

const env = {};
for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const idx = trimmed.indexOf("=");
  if (idx === -1) continue;
  env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
}

if (!env.WEBHOOK_URL) {
  console.error("WEBHOOK_URL is not set in cap-try-on/.env");
  process.exit(1);
}

const contents = `window.CAP_TRY_ON_CONFIG = {\n  WEBHOOK_URL: ${JSON.stringify(env.WEBHOOK_URL)},\n};\n`;
fs.writeFileSync(outPath, contents);
console.log(`Wrote ${outPath}`);
