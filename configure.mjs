import { readFileSync, writeFileSync } from 'node:fs';

const namespace = process.env.REPORTS_KV_ID;
if (!/^[0-9a-f]{32}$/i.test(namespace || '')) {
  throw new Error('Set REPORTS_KV_ID in Cloudflare build settings');
}

const path = new URL('./wrangler.jsonc', import.meta.url);
const config = JSON.parse(readFileSync(path, 'utf8'));
config.kv_namespaces[0].id = namespace;
writeFileSync(path, JSON.stringify(config, null, 2) + '\n');
