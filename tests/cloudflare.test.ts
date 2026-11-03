import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { cloudflareBuildPlan } from '../config/cloudflare';
import { reviewFlags, type ReviewSettings } from '../config/review-mode';

const settings:ReviewSettings={enabled:true,branch:'codex/team-review'};
test('Cloudflare public and review targets have distinct modes, branches and output folders',()=>{
  assert.deepEqual(cloudflareBuildPlan('public',settings,{}),{target:'public',branch:'main',mode:'production',outDir:'dist'});
  assert.deepEqual(cloudflareBuildPlan('review',settings,{}),{target:'review',branch:'codex/team-review',mode:'team-review',outDir:'dist-team-review'});
  assert.equal(cloudflareBuildPlan('public',settings,{WORKERS_CI:'1',WORKERS_CI_BRANCH:'main'}).mode,'production');
  assert.equal(cloudflareBuildPlan('review',settings,{WORKERS_CI:'1',WORKERS_CI_BRANCH:'codex/team-review'}).mode,'team-review');
});
test('ambiguous or mismatched Cloudflare build targets and Git branches fail before building',()=>{
  for(const value of [undefined,'production','all-open']) assert.throws(()=>cloudflareBuildPlan(value,settings,{}),/explicit Cloudflare target/);
  assert.throws(()=>cloudflareBuildPlan('public',settings,{CLOUDFLARE_BUILD_TARGET:'review'}),/Conflicting/);
  assert.throws(()=>cloudflareBuildPlan('review',settings,{WORKERS_CI:'1'}),/ambiguous/);
  assert.throws(()=>cloudflareBuildPlan('review',settings,{WORKERS_CI_BRANCH:'main'}),/must build codex\/team-review/);
  assert.throws(()=>cloudflareBuildPlan('public',settings,{WORKERS_CI_BRANCH:'codex/team-review'}),/must build main/);
});
test('the Cloudflare review kill switch deploys date-based content to the review Worker',()=>{
  for(const [s,env] of [[{...settings,enabled:false},{}],[settings,{TEAM_REVIEW_ENABLED:'false'}],[settings,{TEAM_REVIEW_ENABLED:'0'}]] as const) {
    const plan=cloudflareBuildPlan('review',s,env);assert.equal(plan.mode,'production');assert.equal(plan.outDir,'dist-team-review');
  }
});
test('all-open mode cannot bypass the Cloudflare public build role',()=>{
  assert.throws(()=>reviewFlags('build','team-review',settings,{CLOUDFLARE_BUILD_TARGET:'public'}),/separate review target/);
  assert.throws(()=>reviewFlags('build','team-review',settings,{WORKERS_CI:'1',WORKERS_CI_BRANCH:'main'}),/separate review target/);
  assert.deepEqual(reviewFlags('build','team-review',settings,{WORKERS_CI:'1',CLOUDFLARE_BUILD_TARGET:'review'}),{teamReview:true,review:true});
  assert.deepEqual(reviewFlags('build','production',settings,{WORKERS_CI:'1',CLOUDFLARE_BUILD_TARGET:'public'}),{teamReview:false,review:false});
});
test('Cloudflare deployment configurations rebuild their own assets and use SPA routing',()=>{
  const configs=['public','review'].map(target=>JSON.parse(readFileSync(new URL(`../wrangler.${target}.jsonc`,import.meta.url),'utf8')));
  assert.notEqual(configs[0].name,configs[1].name);
  for(const [index,config] of configs.entries()) {
    assert.equal(config.assets.directory,index===0?'./dist':'./dist-team-review');
    assert.equal(config.assets.not_found_handling,'single-page-application');assert.equal(config.workers_dev,true);
    assert.equal(config.preview_urls,false);assert.equal(config.main,undefined);assert.equal(config.account_id,undefined);
    assert.equal(config.build.command,`npm run build:cloudflare:${index===0?'public':'review'}`);
  }
  const headers=readFileSync(new URL('../public/_headers',import.meta.url),'utf8');
  for(const value of ['X-Content-Type-Options: nosniff','X-Frame-Options: DENY','Referrer-Policy: strict-origin-when-cross-origin']) assert.ok(headers.includes(value));
});
