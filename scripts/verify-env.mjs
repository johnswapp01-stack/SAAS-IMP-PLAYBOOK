/**
 * Verify required/recommended environment variables for Implementation Pro.
 * Loads `.env.local` from the repo root when present (simple KEY=VAL lines).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envLocal = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envLocal)) {
  const raw = fs.readFileSync(envLocal, 'utf8');
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

const recommended = [
  'NEXT_PUBLIC_APP_URL',
  'ANTHROPIC_API_KEY',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PRO_PRICE_ID',
  'NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID',
  'STRIPE_WEBHOOK_SECRET',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
  'RESEND_API_KEY',
];

let failed = false;

console.log('Implementation Pro — environment check\n');

for (const k of required) {
  const v = process.env[k];
  if (!v || v.includes('your_')) {
    console.error(`  [missing] ${k}`);
    failed = true;
  } else {
    console.log(`  [ok] ${k}`);
  }
}

for (const k of recommended) {
  const v = process.env[k];
  if (!v || v.includes('your_')) {
    console.warn(`  [optional] ${k} — not set (feature may be disabled)`);
  } else {
    console.log(`  [ok] ${k}`);
  }
}

if (failed) {
  console.error('\nFix required keys in .env.local (see .env.example).');
  process.exit(1);
}

console.log('\nRequired keys present. Optional gaps are warnings only.');
process.exit(0);
