import type { Activity, ActivityProgress, Filters, Progress, TrackId } from '../types';
import { tasks } from '../content/work';

export const EDITION = 2026;
export const emptyProgress = (): ActivityProgress => ({ opened: false, tried: false, saved: false, used: false });
export const progressKey = (track: TrackId) => `smarter-work:${EDITION}:${track}`;
export const unlockTime = (day: number) => new Date(EDITION, 11, day, 0, 0, 0, 0);
export const isUnlocked = (day: number, now = new Date(), review = false) => review || now.getTime() >= unlockTime(day).getTime();
export const workbookUnlocked = (now = new Date(), review = false) => isUnlocked(24, now, review);
export function countdown(now: Date) {
  const next = Array.from({ length: 24 }, (_, i) => i + 1).find(day => !isUnlocked(day, now));
  if (!next) return null;
  const diff = Math.max(0, unlockTime(next).getTime() - now.getTime());
  return { day: next, days: Math.floor(diff / 86400000), hours: Math.floor(diff / 3600000) % 24, minutes: Math.floor(diff / 60000) % 60, seconds: Math.floor(diff / 1000) % 60 };
}

export interface Route { track: TrackId | null; day: number | null; view?: 'discover' | 'saved' | 'toolkit'; task?: import('../types').TaskId }
export function parseRoute(search: string): Route {
  const params = new URLSearchParams(search);
  const view = params.get('view');
  if (view !== null) {
    if (!['discover', 'saved', 'toolkit'].includes(view) || params.has('track') || params.has('day')) return { track: null, day: null };
    const task = params.get('task');
    if (task !== null && (view !== 'toolkit' || !tasks.some(t => t.id === task))) return { track: null, day: null };
    return { track: null, day: null, view: view as Route['view'], ...(task ? { task: task as Route['task'] } : {}) };
  }
  const track = params.get('track');
  const day = params.get('day');
  if (track !== 'business' && track !== 'guided') return { track: null, day: null };
  if (day !== null && (!/^\d+$/.test(day) || Number(day) < 1 || Number(day) > 24)) return { track: null, day: null };
  return { track, day: day === null ? null : Number(day) };
}
export function routeUrl(route: Route): string {
  if (route.view) return `${window.location.pathname}?${new URLSearchParams({ view: route.view, ...(route.task ? { task: route.task } : {}) })}`;
  if (!route.track) return window.location.pathname;
  const params = new URLSearchParams({ track: route.track });
  if (route.day) params.set('day', String(route.day));
  return `${window.location.pathname}?${params}`;
}

type StorageReader = Pick<Storage, 'getItem'>;
type StorageWriter = StorageReader & Pick<Storage, 'setItem'>;
export function readProgress(storage: StorageReader): { progress: Progress; warning: boolean } {
  const progress: Progress = {};
  let warning = false;
  for (const track of ['business', 'guided'] as const) {
    try {
      const raw = storage.getItem(progressKey(track));
      if (raw === null) continue;
      const data: unknown = JSON.parse(raw);
      if (!data || typeof data !== 'object' || Array.isArray(data)) { warning = true; continue; }
      for (let day = 1; day <= 24; day++) {
        const id = `${track}-${String(day).padStart(2, '0')}`;
        const value = (data as Record<string, unknown>)[id];
        if (value === undefined) continue;
        if (!value || typeof value !== 'object' || Array.isArray(value)) { warning = true; continue; }
        const p = value as Record<string, unknown>;
        if (['opened', 'tried', 'saved'].some(key => typeof p[key] !== 'boolean')) warning = true;
        if (p.used !== undefined && typeof p.used !== 'boolean') warning = true;
        progress[id] = { opened: p.opened === true, tried: p.tried === true, saved: p.saved === true, used: p.used === true };
      }
    } catch { warning = true; }
  }
  return { progress, warning };
}
export function writeProgress(storage: StorageWriter, track: TrackId, progress: Progress): boolean {
  try {
    const data = Object.fromEntries(Object.entries(progress).filter(([id]) => id.startsWith(`${track}-`)));
    storage.setItem(progressKey(track), JSON.stringify(data));
    return true;
  } catch { return false; }
}
export function filterActivities(activities: Activity[], filters: Filters, progress: Progress, now: Date, review: boolean) {
  const query = normalizeSearch(filters.search);
  const matchedTasks = tasks.filter(t => t.synonyms.some(word => ` ${query} `.includes(` ${normalizeSearch(word)} `)) || query === normalizeSearch(t.title)).map(t => t.id);
  return activities.filter(activity => {
    const unlocked = isUnlocked(activity.day, now, review);
    // Locked activities expose discovery metadata only, even to search.
    const searchable = normalizeSearch([activity.title, activity.summary, ...activity.departments, ...activity.tools, ...activity.work.tasks.map(id => tasks.find(t => t.id === id)!.title), ...(unlocked ? [activity.prompt, ...activity.steps, activity.takeaway, activity.work.prompt] : [])].join(' '));
    const textMatch = !query || query.split(' ').every(word => searchable.includes(word)) || matchedTasks.some(id => activity.work.tasks.includes(id));
    return textMatch && (!filters.task || activity.work.tasks.includes(filters.task)) && (!filters.maxMinutes || activity.minutes <= filters.maxMinutes) && (!filters.level || activity.work.level === filters.level) && (!filters.department || activity.departments.includes(filters.department) || activity.departments.includes('Everyone')) && (!filters.tool || activity.tools.some(tool => tool === filters.tool)) && (!filters.savedOnly || progress[activity.id]?.saved);
  });
}

export function normalizeSearch(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
export const resumeKey = `smarter-work:${EDITION}:resume`;
export function readResume(storage: StorageReader): Route | null {
  try { const raw = storage.getItem(resumeKey); if (!raw) return null; const route = parseRoute(raw); return route.day || route.task ? route : null; } catch { return null; }
}
export function backupText(progress: Progress) {
  return JSON.stringify({ format:'smarter-work-toolkit', version:1, edition:EDITION, progress }, null, 2);
}
export function parseBackup(text: string): Progress {
  if (text.length > 1000000) throw new Error('Choose a toolkit backup smaller than 1 MB.');
  let data: unknown;
  try { data = JSON.parse(text); } catch { throw new Error('This file is not valid JSON. Choose a toolkit backup.'); }
  if (!data || typeof data !== 'object') throw new Error('This is not a toolkit backup.');
  const b = data as Record<string, unknown>;
  if (b.format !== 'smarter-work-toolkit' || b.version !== 1 || b.edition !== EDITION || !b.progress || typeof b.progress !== 'object' || Array.isArray(b.progress)) throw new Error('Choose a 2026 Smarter Work toolkit backup.');
  const progress: Progress = {};
  for (const [id, entry] of Object.entries(b.progress)) {
    if (!/^(business|guided)-(0[1-9]|1[0-9]|2[0-4])$/.test(id) || !entry || typeof entry !== 'object') throw new Error('The backup contains an invalid activity.');
    const value = entry as Record<string, unknown>;
    if (['opened','tried','saved'].some(k => typeof value[k] !== 'boolean') || (value.used !== undefined && typeof value.used !== 'boolean')) throw new Error('The backup contains invalid progress flags.');
    progress[id] = { opened:value.opened === true, tried:value.tried === true, saved:value.saved === true, used:value.used === true };
  }
  return progress;
}
export function mergeProgress(current: Progress, incoming: Progress): Progress {
  const next = { ...current };
  for (const [id, value] of Object.entries(incoming)) {
    const old = next[id] || emptyProgress();
    next[id] = { opened:old.opened || value.opened, tried:old.tried || value.tried, saved:old.saved || value.saved, used:old.used || value.used };
  }
  return next;
}
