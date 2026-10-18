import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
for (const folder of ['dist', 'tmp/review-build']) {
  const files = readdirSync(resolve(folder, 'assets')).filter(file => file.endsWith('.js'));
  const code = files.map(file => readFileSync(resolve(folder, 'assets', file), 'utf8')).join('\n');
  assert.ok(!code.includes('REVIEW PREVIEW'), `${folder} must not contain the review banner or its unlocked branch`);
  assert.ok(!code.includes('cdn.tailwindcss.com'), 'No runtime stylesheet CDN');
  assert.ok(!code.includes('googletagmanager.com'), 'No analytics script');
  console.log(`${folder}: review-only branch removed, no Tailwind CDN or analytics loader`);
}
