import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { hostingBuildMode, readReviewSettings, reviewFlags, type ReviewSettings } from '../config/review-mode';

const enabled:ReviewSettings = { enabled:true, branch:'codex/team-review' };
test('only the dedicated Vercel preview branch selects an all-open hosting build',()=>{
  assert.equal(hostingBuildMode(enabled,{VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:'codex/team-review'}),'team-review');
  for(const env of [{}, {VERCEL_ENV:'production',VERCEL_GIT_COMMIT_REF:'codex/team-review'}, {VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:'main'}, {VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:'codex/another-change'}]) assert.equal(hostingBuildMode(enabled,env),'production');
  const config=JSON.parse(readFileSync(new URL('../vercel.json',import.meta.url),'utf8'));
  assert.equal(config.buildCommand,'npm run build:hosting'); assert.equal(config.outputDirectory,'dist');
  assert.equal(readReviewSettings().branch,'codex/team-review');
});
test('normal builds keep dates even with review flags or the old review mode',()=>{
  for(const mode of ['production','review']) {
    assert.deepEqual(reviewFlags('build',mode,enabled,{TEAM_REVIEW_ENABLED:'true',VERCEL_ENV:'production'}),{teamReview:false,review:false});
  }
  assert.deepEqual(reviewFlags('serve','review',enabled,{}),{teamReview:false,review:true});
});
test('team review cannot be built for the Vercel production environment',()=>{
  assert.throws(()=>reviewFlags('build','team-review',enabled,{VERCEL_ENV:'production'}),/only be deployed as a Vercel Preview/);
  assert.throws(()=>reviewFlags('build','team-review',enabled,{VERCEL:'1'}),/only be deployed as a Vercel Preview/);
  assert.deepEqual(reviewFlags('build','team-review',enabled,{VERCEL:'1',VERCEL_ENV:'preview'}),{teamReview:true,review:true});
  assert.deepEqual(reviewFlags('build','team-review',enabled,{}),{teamReview:true,review:true});
});
test('the configuration switch or environment switch closes future review builds',()=>{
  for(const [settings, env] of [[{...enabled,enabled:false},{}],[enabled,{TEAM_REVIEW_ENABLED:'false'}],[enabled,{TEAM_REVIEW_ENABLED:'0'}]] as const) {
    assert.equal(hostingBuildMode(settings,{...env,VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:enabled.branch}),'production');
    assert.throws(()=>reviewFlags('build','team-review',settings,env),/Team review is disabled/);
  }
});
