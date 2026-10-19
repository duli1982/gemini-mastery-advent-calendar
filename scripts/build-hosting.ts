import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { hostingBuildMode, readReviewSettings } from '../config/review-mode';

const mode = hostingBuildMode(readReviewSettings(), process.env);
console.log(mode === 'team-review' ? 'Building the separate all-open team review.' : 'Building the date-based production site.');
for (const [file, args] of [
  ['../node_modules/typescript/bin/tsc', ['--noEmit']],
  // Vercel serves dist for either environment; only the dedicated preview branch
  // is allowed to choose team-review. Manual review builds use a separate folder.
  ['../node_modules/vite/bin/vite.js', ['build', '--mode', mode, '--outDir', 'dist']],
] as const) {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL(file, import.meta.url)), ...args], { stdio: 'inherit', env: process.env });
  if (result.error) { console.error(result.error.message); process.exit(1); }
  if (result.status !== 0) process.exit(result.status || 1);
}
