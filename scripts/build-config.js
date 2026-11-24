#!/usr/bin/env node
// Writes cap-try-on/config.js (gitignored) from WEBHOOK_URL.
// Reads it from the host's environment first (e.g. Vercel project env vars),
// falling back to a local cap-try-on/.env file for local dev.
const fs = require("fs");
const path = require("path");

const appDir = path.join(__dirname, "..", "cap-try-on");
const envPath = path.join(appDir, ".env");
const outPath = path.join(appDir, "config.js");

const env = { ...process.env };

if (!env.WEBHOOK_URL && fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    if (!env[key]) env[key] = trimmed.slice(idx + 1).trim();
  }
}

if (!env.WEBHOOK_URL) {
  console.error(
    "WEBHOOK_URL is not set. Either set it as an environment variable (e.g. in your host's project settings) " +
      "or copy cap-try-on/.env.example to cap-try-on/.env and fill it in for local dev."
  );
  process.exit(1);
}

const contents = `window.CAP_TRY_ON_CONFIG = {\n  WEBHOOK_URL: ${JSON.stringify(env.WEBHOOK_URL)},\n};\n`;
fs.writeFileSync(outPath, contents);
console.log(`Wrote ${outPath}`);
