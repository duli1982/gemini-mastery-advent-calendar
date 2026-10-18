import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { tracks, allActivities, practices } from '../src/content/index.ts';
import { emptyProgress, filterActivities, isUnlocked, parseRoute, progressKey, readProgress, unlockTime, workbookUnlocked, writeProgress } from '../src/lib/core.ts';
import { exercisePrompt } from '../src/lib/download.ts';

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
  const progress = { 'business-01': { opened: true, tried: true, saved: false }, 'guided-01': { opened: false, tried: false, saved: true } };
  assert.equal(writeProgress(storage, 'business', progress), true);
  assert.equal(readProgress(storage).progress['guided-01'], undefined);
  assert.equal(writeProgress(storage, 'guided', progress), true);
  assert.deepEqual(readProgress(storage).progress, progress);
  assert.ok(!data.get(progressKey('business'))?.includes('guided'));
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
