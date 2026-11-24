#!/usr/bin/env node
// Writes cap-try-on/config.js (gitignored) from WEBHOOK_URL, SUPABASE_URL and SUPABASE_ANON_KEY.
// Reads it from the host's environment first (e.g. Vercel project env vars),
// falling back to a local cap-try-on/.env file for local dev.
const fs = require("fs");
const path = require("path");

const appDir = path.join(__dirname, "..", "cap-try-on");
const envPath = path.join(appDir, ".env");
const outPath = path.join(appDir, "config.js");

const env = { ...process.env };

const required = ["WEBHOOK_URL", "SUPABASE_URL", "SUPABASE_ANON_KEY"];

if (required.some((key) => !env[key]) && fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    if (!env[key]) env[key] = trimmed.slice(idx + 1).trim();
  }
}

const missing = required.filter((key) => !env[key]);
if (missing.length > 0) {
  console.error(
    `Missing env var(s): ${missing.join(", ")}. Either set them as environment variables (e.g. in your host's project settings) ` +
      "or copy cap-try-on/.env.example to cap-try-on/.env and fill them in for local dev."
  );
  process.exit(1);
}

const contents = `window.CAP_TRY_ON_CONFIG = {\n  WEBHOOK_URL: ${JSON.stringify(env.WEBHOOK_URL)},\n  SUPABASE_URL: ${JSON.stringify(env.SUPABASE_URL)},\n  SUPABASE_ANON_KEY: ${JSON.stringify(env.SUPABASE_ANON_KEY)},\n};\n`;
fs.writeFileSync(outPath, contents);
console.log(`Wrote ${outPath}`);
