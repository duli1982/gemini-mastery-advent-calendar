import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { tracks } from '../src/content/index.ts';
import { emptyProgress, filterActivities } from '../src/lib/core.ts';
import { calendarSummary, emptyReminderPreferences, localDayKey, readReminderPreferences, reminderKey, writeReminderPreferences } from '../src/lib/reminders.ts';

const business=tracks.find(t=>t.id==='business')!.activities;
const guided=tracks.find(t=>t.id==='guided')!.activities;
const filters={search:'',department:'',tool:'',savedOnly:false,unopenedOnly:true};

test('catch-up counts only unlocked, unopened lessons in the selected track',()=>{
  const progress={'business-01':{...emptyProgress(),opened:true},'business-02':{...emptyProgress(),opened:true,tried:true}};
  const now=new Date(2026,11,8,9);
  const summary=calendarSummary(business,progress,now);
  assert.equal(summary.available.length,8);assert.equal(summary.unopened.length,6);assert.equal(summary.today?.day,8);
  assert.equal(summary.next?.getTime(),new Date(2026,11,9).getTime());
  assert.deepEqual(filterActivities(business,filters,progress,now,false).map(a=>a.day),[3,4,5,6,7,8]);
  assert.equal(calendarSummary(guided,progress,now).unopened.length,8);
  assert.equal(filterActivities(business,filters,progress,new Date(2026,10,30),false).length,0);
});

test('opening a lesson is distinct from trying it or using it at work',()=>{
  const now=new Date(2026,11,1);
  let summary=calendarSummary(business,{'business-01':{...emptyProgress(),opened:true}},now);
  assert.equal(summary.unopened.length,0);assert.equal(summary.practice?.day,1);
  summary=calendarSummary(business,{'business-01':{...emptyProgress(),opened:true,tried:true}},now);assert.equal(summary.practice,undefined);
  summary=calendarSummary(business,{'business-01':{...emptyProgress(),opened:true,used:true}},now);assert.equal(summary.practice,undefined);
});

test('today reminders do not recur in 2027; review remains all-open',()=>{
  assert.equal(calendarSummary(business,{},new Date(2026,10,30)).available.length,0);
  const after=calendarSummary(business,{},new Date(2027,11,8));assert.equal(after.available.length,24);assert.equal(after.today,undefined);assert.equal(after.next,undefined);
  const review=calendarSummary(business,{},new Date(2026,9,19),true);assert.equal(review.available.length,24);assert.equal(review.today,undefined);assert.equal(review.next,undefined);
});

test('reminder dismissals are track-specific and stored separately from progress',()=>{
  const data=new Map<string,string>();const storage={getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>{data.set(key,value);}};
  assert.deepEqual(readReminderPreferences(storage),{preferences:emptyReminderPreferences(),warning:false});
  assert.equal(writeReminderPreferences(storage,{business:'2026-12-08',guided:''}),true);
  assert.deepEqual(readReminderPreferences(storage).preferences,{business:'2026-12-08',guided:''});assert.deepEqual([...data.keys()],[reminderKey]);
});

test('malformed and blocked preference storage uses safe defaults',()=>{
  for(const raw of ['broken','null','[]','{"business":true,"guided":5}']) {
    const result=readReminderPreferences({getItem:()=>raw});assert.equal(result.warning,true);assert.deepEqual(result.preferences,emptyReminderPreferences());
  }
  assert.equal(readReminderPreferences({getItem:()=>{throw Error('blocked');}}).warning,true);
  assert.equal(writeReminderPreferences({setItem:()=>{throw Error('blocked');}},emptyReminderPreferences()),false);
});

for(const timezone of ['Europe/Budapest','Europe/London','America/New_York']) {
  test(`reminder day and dismissals change at local midnight in ${timezone}`,()=>{
    const script=`import assert from 'node:assert/strict';import {tracks} from './src/content/index.ts';import {calendarSummary,localDayKey} from './src/lib/reminders.ts';const activities=tracks[0].activities;assert.equal(localDayKey(new Date(2026,11,7,23,59,59)),'2026-12-07');assert.equal(calendarSummary(activities,{},new Date(2026,11,7,23,59,59)).today.day,7);assert.equal(localDayKey(new Date(2026,11,8)),'2026-12-08');assert.equal(calendarSummary(activities,{},new Date(2026,11,8)).today.day,8);`;
    const result=spawnSync(process.execPath,['--import','tsx','--input-type=module','-e',script],{env:{...process.env,TZ:timezone},encoding:'utf8'});assert.equal(result.status,0,result.stderr);
  });
}
