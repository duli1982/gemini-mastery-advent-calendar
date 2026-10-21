import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { allActivities, practices } from '../src/content/index.ts';
import { jobAidText } from '../src/lib/download.ts';
import { hasSeenWelcome, rememberWelcome, welcomeKey } from '../src/lib/welcome.ts';

test('welcome dismissal uses its own edition key and tolerates blocked or malformed storage',()=>{
  const data=new Map<string,string>([['smarter-work:2026:business','preserve me']]);
  const storage={getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>{data.set(key,value);}};
  assert.equal(hasSeenWelcome(storage),false);data.set(welcomeKey,'broken');assert.equal(hasSeenWelcome(storage),false);
  assert.equal(rememberWelcome(storage),true);assert.equal(hasSeenWelcome(storage),true);
  assert.equal(data.get('smarter-work:2026:business'),'preserve me');
  assert.equal(hasSeenWelcome({getItem:()=>{throw Error('blocked');}}),false);
  assert.equal(rememberWelcome({setItem:()=>{throw Error('blocked');}}),false);
});

test('site, lesson materials and job aids have company-neutral attribution',()=>{
  for(const file of ['index.html','src/App.tsx','src/components/Lesson.tsx','src/lib/workbook.ts']) assert.doesNotMatch(readFileSync(new URL('../'+file,import.meta.url),'utf8'),/randstad|\bgbs\b/i,file);
  assert.doesNotMatch(JSON.stringify([allActivities,practices]),/randstad|\bgbs\b/i);
  for(const activity of allActivities) {assert.doesNotMatch(jobAidText(activity),/randstad|\bgbs\b/i);assert.match(jobAidText(activity),/From the People, to the People\./);}
});
