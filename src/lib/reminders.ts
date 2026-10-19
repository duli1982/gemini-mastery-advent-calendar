import type { Activity, Progress, TrackId } from '../types';
import { EDITION, isUnlocked, unlockTime } from './core';

export const reminderKey = `smarter-work:${EDITION}:reminders`;
export type ReminderPreferences = Record<TrackId, string>;
export const emptyReminderPreferences = (): ReminderPreferences => ({ business:'', guided:'' });
// Calendar days must use the visitor's timezone, including dismissal expiry.
export const localDayKey = (date:Date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;

export function readReminderPreferences(storage:Pick<Storage,'getItem'>): { preferences:ReminderPreferences; warning:boolean } {
  const preferences=emptyReminderPreferences();
  try {
    const raw=storage.getItem(reminderKey);
    if(raw===null) return {preferences,warning:false};
    const data:unknown=JSON.parse(raw);
    if(!data || typeof data!=='object' || Array.isArray(data)) return {preferences,warning:true};
    let warning=false;
    for(const track of ['business','guided'] as const) {
      const value=(data as Record<string,unknown>)[track];
      if(value==='' || (typeof value==='string' && /^\d{4}-\d{2}-\d{2}$/.test(value))) preferences[track]=value;
      else warning=true;
    }
    return {preferences,warning};
  } catch { return {preferences,warning:true}; }
}

export function writeReminderPreferences(storage:Pick<Storage,'setItem'>, preferences:ReminderPreferences) {
  try { storage.setItem(reminderKey,JSON.stringify(preferences)); return true; } catch { return false; }
}

export function calendarSummary(activities:Activity[], progress:Progress, now:Date, review=false) {
  const available=activities.filter(a=>isUnlocked(a.day,now,review));
  const unopened=available.filter(a=>!progress[a.id]?.opened);
  const today=!review && now.getFullYear()===EDITION && now.getMonth()===11
    ? available.find(a=>a.day===now.getDate()) : undefined;
  const next=review ? undefined : activities.find(a=>!isUnlocked(a.day,now));
  // Used-at-work is already evidence of application; do not nudge those lessons.
  const practice=[...available].reverse().find(a=>progress[a.id]?.opened && !progress[a.id]?.tried && !progress[a.id]?.used);
  return {available,unopened,today,next:next ? unlockTime(next.day) : undefined,practice};
}
