import { EDITION } from './core';

export const welcomeKey = `smarter-work:${EDITION}:welcome`;
export function hasSeenWelcome(storage:Pick<Storage,'getItem'>) {
  try { return storage.getItem(welcomeKey)==='1'; } catch { return false; }
}
export function rememberWelcome(storage:Pick<Storage,'setItem'>) {
  try { storage.setItem(welcomeKey,'1'); return true; } catch { return false; }
}
