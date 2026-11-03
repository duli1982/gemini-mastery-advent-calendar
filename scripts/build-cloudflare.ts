import { spawnSync } from 'node:child_process';
import { appendFileSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cloudflareBuildPlan } from '../config/cloudflare';
import { readReviewSettings } from '../config/review-mode';

const plan=cloudflareBuildPlan(process.argv[2],readReviewSettings(),process.env);
console.log(`Cloudflare ${plan.target}: ${plan.mode==='team-review'?'all doors open':'December 2026 dates'} -> ${plan.outDir}`);
const env={...process.env,CLOUDFLARE_BUILD_TARGET:plan.target};
for(const [file,args] of [
  ['../node_modules/typescript/bin/tsc',['--noEmit']],
  ['../node_modules/vite/bin/vite.js',['build','--mode',plan.mode,'--outDir',plan.outDir]],
] as const) {
  const result=spawnSync(process.execPath,[fileURLToPath(new URL(file,import.meta.url)),...args],{stdio:'inherit',env});
  if(result.error) {console.error(result.error.message);process.exit(1);}
  if(result.status!==0) process.exit(result.status || 1);
}
// Validate the actual artifact, including when review is disabled. A public
// deployment cannot silently pick up an old all-open output directory.
const assets=resolve(plan.outDir,'assets');
const code=readdirSync(assets).filter(file=>file.endsWith('.js')).map(file=>readFileSync(resolve(assets,file),'utf8')).join('\n');
if(code.includes('TEAM REVIEW')!==(plan.mode==='team-review') || code.includes('REVIEW PREVIEW')) throw new Error('Built calendar mode does not match its Cloudflare deployment target.');
if(plan.target==='review') appendFileSync(resolve(plan.outDir,'_headers'),'\n/*\n  X-Robots-Tag: noindex, nofollow, noarchive\n');
