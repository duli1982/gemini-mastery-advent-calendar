import type { Activity, ActivityProgress, Filters, Progress, TrackId } from '../types';

export const EDITION = 2026;
export const emptyProgress = (): ActivityProgress => ({ opened: false, tried: false, saved: false });
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

export interface Route { track: TrackId | null; day: number | null }
export function parseRoute(search: string): Route {
  const params = new URLSearchParams(search);
  const track = params.get('track');
  const day = params.get('day');
  if (track !== 'business' && track !== 'guided') return { track: null, day: null };
  if (day !== null && (!/^\d+$/.test(day) || Number(day) < 1 || Number(day) > 24)) return { track: null, day: null };
  return { track, day: day === null ? null : Number(day) };
}
export function routeUrl(route: Route): string {
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
        progress[id] = { opened: p.opened === true, tried: p.tried === true, saved: p.saved === true };
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
  const query = filters.search.toLowerCase().trim();
  return activities.filter(activity => {
    const unlocked = isUnlocked(activity.day, now, review);
    // Locked activities expose discovery metadata only, even to search.
    const searchable = [activity.title, activity.summary, ...activity.departments, ...activity.tools, ...(unlocked ? [activity.prompt, ...activity.steps, activity.takeaway] : [])].join(' ').toLowerCase();
    return (!query || searchable.includes(query)) && (!filters.department || activity.departments.includes(filters.department) || activity.departments.includes('Everyone')) && (!filters.tool || activity.tools.some(tool => tool === filters.tool)) && (!filters.savedOnly || progress[activity.id]?.saved);
  });
}
