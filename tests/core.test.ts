import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { tracks, allActivities, practices } from '../src/content/index.ts';
import { backupText, emptyProgress, filterActivities, isUnlocked, mergeProgress, parseBackup, parseRoute, progressKey, readProgress, readResume, unlockTime, workbookUnlocked, writeProgress } from '../src/lib/core.ts';
import { exercisePrompt, jobAidText } from '../src/lib/download.ts';
import { departmentVariants, tasks } from '../src/content/work.ts';

test('both complete sequences contain 24 distinct and fully authored lessons', () => {
  assert.equal(allActivities.length, 48);
  assert.equal(new Set(allActivities.map(a => a.id)).size, 48);
  for (const track of tracks) {
    assert.deepEqual(track.activities.map(a => a.day), Array.from({ length: 24 }, (_, i) => i + 1));
    for (const a of track.activities) {
      assert.equal(a.track, track.id);
      for (const key of ['title', 'summary', 'prerequisites', 'prompt', 'takeaway', 'advanced', 'fallback', 'difference'] as const) assert.ok(a[key].length > 15, `${a.id}: ${key}`);
      assert.ok(a.prompt.length > 180, a.id);
      assert.ok(a.steps.length >= 3 && a.steps.length <= 5, a.id);
      assert.ok(a.expected.length >= 2 && a.checks.length >= 2, a.id);
      assert.ok(a.departments.length && a.tools.length && a.references.length);
      assert.equal(a.verified, '2026-10-18');
      assert.ok(!JSON.stringify(a).includes('Google Flow'));
      for (const ref of a.references) assert.match(ref.url, /^https:\/\/(support|workspace|workspaceupdates)\.google/);
      for (const id of a.practiceIds) assert.ok(practices[id]?.text.length > 100, `${a.id}: ${id}`);
      assert.ok(exercisePrompt(a).includes(practices[a.practiceIds[0]].text));
      assert.ok(a.practiceIds.some(id=>(practices[id].workedExample?.length || 0)>150), `${a.id}: worked evidence or calculation`);
    }
  }
});

test('every CSV has stable columns and useful data rows', () => {
  for (const p of Object.values(practices).filter(p => p.format === 'csv')) {
    const rows = p.text.split('\n').map(row => row.split(','));
    assert.ok(rows.length >= 4, p.id);
    assert.ok(rows.every(row => row.length === rows[0].length), p.id);
  }
});

test('unlock boundaries are exactly local midnight and never reset in January', () => {
  assert.equal(isUnlocked(1, new Date(2026, 10, 30, 23, 59, 59, 999)), false);
  assert.equal(isUnlocked(1, new Date(2026, 11, 1, 0, 0, 0)), true);
  assert.equal(isUnlocked(2, new Date(2026, 11, 1, 23, 59, 59)), false);
  assert.equal(workbookUnlocked(new Date(2026, 11, 23, 23, 59, 59)), false);
  assert.equal(workbookUnlocked(new Date(2026, 11, 24)), true);
  assert.equal(isUnlocked(24, new Date(2027, 0, 1)), true);
  assert.equal(isUnlocked(24, new Date(2030, 0, 1)), true);
  assert.equal(isUnlocked(24, new Date(2026, 0, 1), true), true);
});

for (const timezone of ['UTC', 'Europe/Budapest', 'America/New_York', 'Asia/Tokyo']) {
  test(`midnight boundaries hold in ${timezone}`, () => {
    const script = `import assert from 'node:assert/strict'; import {isUnlocked} from './src/lib/core.ts'; assert.equal(isUnlocked(1,new Date(2026,10,30,23,59,59)),false); assert.equal(isUnlocked(1,new Date(2026,11,1)),true); assert.equal(isUnlocked(24,new Date(2027,0,1)),true);`;
    const result = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', script], { env: { ...process.env, TZ: timezone }, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
  });
}

test('routes reject unknown tracks, invalid days and incomplete deep links', () => {
  assert.deepEqual(parseRoute('?track=business&day=5'), { track: 'business', day: 5 });
  assert.deepEqual(parseRoute('?track=guided'), { track: 'guided', day: null });
  for (const search of ['?track=wrong', '?day=4', '?track=guided&day=0', '?track=guided&day=25', '?track=guided&day=2.5', '?track=guided&day=abc']) assert.deepEqual(parseRoute(search), { track: null, day: null });
});

test('progress is isolated by track, survives round trip, and ignores the 2025 key', () => {
  const data = new Map<string, string>([['geminiAdventOpenedDays', '[1,2,3]']]);
  const storage = { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); } };
  assert.deepEqual(readProgress(storage).progress, {});
  const progress = { 'business-01': { opened: true, tried: true, saved: false, used: true }, 'guided-01': { opened: false, tried: false, saved: true, used: false } };
  assert.equal(writeProgress(storage, 'business', progress), true);
  assert.equal(readProgress(storage).progress['guided-01'], undefined);
  assert.equal(writeProgress(storage, 'guided', progress), true);
  assert.deepEqual(readProgress(storage).progress, progress);
  assert.ok(!data.get(progressKey('business'))?.includes('guided'));
});

test('all 48 lessons have complete work guides, job aids and valid cross-track links', () => {
  for(const a of allActivities) {
    assert.ok(a.work.prompt.length > 180, a.id);
    assert.ok(!/Paste the practice|TRAINING-REQUEST Complete|Alex@example/i.test(a.work.prompt),a.id);
    assert.ok(a.work.inputs.length >= 2 && a.work.steps.length === 3 && a.work.checks.length >= 2,a.id);
    assert.ok(a.work.output.length > 20 && a.work.template.length > 50,a.id);
    assert.ok(a.work.tasks.length && a.work.tasks.every(id=>tasks.some(t=>t.id===id)),a.id);
    assert.ok(allActivities.some(other=>other.track===a.related.track && other.day===a.related.day),a.id);
    assert.notEqual(a.related.track,a.track);
    for(const id of a.work.variantIds) assert.ok(departmentVariants[id],id);
    const aid = jobAidText(a);
    for(const section of ['USE THIS WHEN','HAVE READY','OPEN','DO','YOU WILL GET','WORK PROMPT','OUTPUT TEMPLATE','CHECK']) assert.ok(aid.includes(section),`${a.id} ${section}`);
    assert.ok(!aid.includes('FICTIONAL TRAINING INPUTS'));
  }
  assert.equal(tasks.length,8);
  assert.ok(new Set(Object.values(departmentVariants).map(v=>v.department)).size >= 8);
});

test('practice copying excludes worked answers and preserves the rules', () => {
  for(const a of allActivities) {
    const prompt=exercisePrompt(a);
    assert.ok(!/Answer key:|Answer key at|Expected handling:|\nExpected:/.test(prompt),a.id);
    assert.ok(!prompt.includes('Created increased 33.33%'),a.id);
    for(const id of a.practiceIds) if(practices[id].workedExample) assert.ok(!prompt.includes(practices[id].workedExample!),a.id);
  }
  assert.ok(practices['invoice-rules'].text.includes('Review date: 10 December 2026'));
  assert.ok(practices['kpi-definitions'].text.includes('SUM(closed_within_target)'));
  assert.ok(practices['kpi-definitions'].workedExample?.includes('138/170'));
});

test('task synonyms and time/experience filters work across tracks without exposing locked work prompts', () => {
  const base={search:'meeting minutes',department:'',tool:'',savedOnly:false};
  const matches=filterActivities(allActivities,base,{},new Date(2026,9,18),false);
  assert.ok(matches.some(a=>a.track==='business' && a.day===9));
  assert.ok(matches.some(a=>a.track==='guided' && a.day===4));
  const limited=filterActivities(allActivities,{...base,search:'',maxMinutes:10,level:'Starter'}, {},new Date(2026,9,18),false);
  assert.ok(limited.length>0 && limited.every(a=>a.minutes<=10 && a.work.level==='Starter'));
  const a={...allActivities[0],work:{...allActivities[0].work,prompt:'private secret absentword'}};
  assert.equal(filterActivities([a],{...base,search:'private secret absentword'},{},new Date(2026,9,18),false).length,0);
});

test('toolkit routes are separate from calendar unlocks and reject invalid mixed routes', () => {
  assert.deepEqual(parseRoute('?view=toolkit&task=email'),{track:null,day:null,view:'toolkit',task:'email'});
  assert.equal(isUnlocked(4,new Date(2026,9,18)),false);
  for(const q of ['?view=wrong','?view=toolkit&task=unknown','?view=saved&task=email','?view=toolkit&track=business&day=24']) assert.deepEqual(parseRoute(q),{track:null,day:null});
  assert.equal(readResume({getItem:()=>'?view=toolkit&task=email'})?.task,'email');
  assert.equal(readResume({getItem:()=>'{bad'}),null);
});

test('old progress gains used=false without losing saved/tried flags', () => {
  const result=readProgress({getItem:key=>key.endsWith('business')?JSON.stringify({'business-01':{opened:true,tried:true,saved:true}}):null});
  assert.equal(result.warning,false);
  assert.deepEqual(result.progress['business-01'],{opened:true,tried:true,saved:true,used:false});
});

test('toolkit backups validate and merge independently without clearing existing progress', () => {
  const current={'business-01':{...emptyProgress(),saved:true},'guided-01':{...emptyProgress(),tried:true}};
  const incoming={'business-01':{...emptyProgress(),used:true},'guided-02':{...emptyProgress(),saved:true}};
  const restored=parseBackup(backupText(incoming));
  const merged=mergeProgress(current,restored);
  assert.equal(merged['business-01'].saved,true); assert.equal(merged['business-01'].used,true);
  assert.equal(merged['guided-01'].tried,true); assert.equal(merged['guided-02'].saved,true);
  for(const text of ['null','{',backupText(incoming).replace('2026','2025'),backupText(incoming).replace('business-01','business-99'),backupText(incoming).replace('"used": true','"used": "true"')]) assert.throws(()=>parseBackup(text));
  assert.throws(()=>parseBackup(' '.repeat(1000001)));
});

test('malformed and unavailable storage fails safely', () => {
  for (const bad of ['{', 'null', '[]', '123', '{"guided-01":{"opened":"true","saved":true}}']) {
    const result = readProgress({ getItem: key => key.endsWith('guided') ? bad : null });
    assert.equal(result.warning, true);
    assert.equal(result.progress['guided-01']?.opened ?? false, false);
  }
  const blocked = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('quota'); } };
  assert.equal(readProgress(blocked).warning, true);
  assert.equal(writeProgress(blocked, 'guided', {}), false);
});

test('search exposes only discovery metadata for locked lessons', () => {
  const a = tracks[0].activities[0];
  const filters = { search: 'exact hidden sentence', department: '', tool: '', savedOnly: false };
  const custom = { ...a, prompt: 'exact hidden sentence' };
  assert.equal(filterActivities([custom], filters, {}, new Date(2026, 10, 1), false).length, 0);
  assert.equal(filterActivities([custom], filters, {}, unlockTime(1), false).length, 1);
  assert.equal(filterActivities([custom], filters, {}, new Date(2026, 10, 1), true).length, 1);
  assert.equal(filterActivities([a], { ...filters, search: a.title, savedOnly: true }, { [a.id]: { ...emptyProgress(), saved: true } }, new Date(2027, 0, 1), false).length, 1);
});
