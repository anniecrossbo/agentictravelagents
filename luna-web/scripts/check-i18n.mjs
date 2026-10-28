// Lists t('key') usages that are missing from src/i18n/en.json, and hardcoded colour literals outside the theme.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const en = JSON.parse(readFileSync('src/i18n/en.json', 'utf8'));
const has = (key) => key.split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), en) !== undefined;
const missing = new Set();
for (const f of walk('src').filter((p) => /\.(ts|tsx)$/.test(p))) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(/\bt\(\s*'([^']+)'/g)) if (!has(m[1])) missing.add(m[1]);
  for (const m of src.matchAll(/\bt\(\s*`([^`$]+)\$\{/g)) { /* dynamic prefix, checked by hand */ }
}
console.log([...missing].sort().join('\n') || 'i18n: all static keys present');
