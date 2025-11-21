/**
 * Utility functions for handling dates
 * All logic is based on the user's local timezone.
 * Days unlock at midnight (00:00:01) in each user's local time.
 */

/**
 * Get current date and time in the user's local timezone
 */
export const getCurrentLocalDate = (): Date => {
  return new Date();
};

/**
 * Check if a specific day is unlocked based on the user's local timezone
 * Days 1-24 unlock at 00:00:01 local time on their respective dates
 *
 * @param day - The day number (1-24)
 * @returns true if the day is unlocked, false otherwise
 */
// Determine if the developer/testing override is enabled to open all days
// Priority: URL param (?openAll=1) > env var (VITE_OPEN_ALL=true)
export const isOpenAllEnabled = (): boolean => {
  try {
    // Enable by default in development (local dev server)
    // Vite sets import.meta.env.MODE to 'development' in dev
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mode = (import.meta as any)?.env?.MODE;
    if (mode === 'development') return true;

    // Additionally, treat localhost/127.0.0.1 as local testing contexts
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1') return true;
    }
  } catch (_) {
    // ignore if import.meta.env or window is unavailable
  }

  try {
    // URL query param override (only when running in browser)
    if (typeof window !== 'undefined' && window?.location?.search) {
      const params = new URLSearchParams(window.location.search);
      const qp = params.get('openAll');
      if (qp === '1' || qp === 'true') return true;
    }
  } catch (_) {
    // no-op: be resilient in non-browser contexts
  }

  try {
    // Vite env var (set in .env.local or deployment vars)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const envFlag = (import.meta as any)?.env?.VITE_OPEN_ALL;
    if (typeof envFlag === 'string') {
      return envFlag.toLowerCase() === 'true' || envFlag === '1';
    }
    if (typeof envFlag === 'boolean') return envFlag;
  } catch (_) {
    // ignore if import.meta.env is unavailable
  }

  return false;
};

export const isDayUnlocked = (day: number): boolean => {
  // Testing override: allow all days to open
  if (isOpenAllEnabled()) {
    return true;
  }

  const now = getCurrentLocalDate();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based, December = 11

  // Only unlock days in December
  if (currentMonth !== 11) {
    return false;
  }

  const currentDay = now.getDate();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentSecond = now.getSeconds();

  // If current day is greater than the requested day, it's unlocked
  if (currentDay > day) {
    return true;
  }

  // If it's the same day, check if it's past 00:00:01
  if (currentDay === day) {
    // Check if time is >= 00:00:01 (allow opening from the first second)
    if (
      currentHour > 0 ||
      currentMinute > 0 ||
      (currentHour === 0 && currentMinute === 0 && currentSecond >= 1)
    ) {
      return true;
    }
  }

  return false;
};

/**
 * Get the unlock time for a specific day in the user's local timezone
 * @param day - The day number (1-24)
 * @param year - The year (defaults to current year)
 * @returns Date object representing when the day unlocks
 */
export const getDayUnlockTime = (day: number, year?: number): Date => {
  const now = getCurrentLocalDate();
  const unlockYear = year || now.getFullYear();

  // Months are 0-based, December = 11
  // All days unlock at local 00:00:01
  return new Date(unlockYear, 11, day, 0, 0, 1);
};

/**
 * Get time remaining until next day unlocks
 * @returns Object with days, hours, minutes, seconds remaining
 */
export const getTimeUntilNextUnlock = (): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMilliseconds: number;
  nextDay: number;
} => {
  // If override is enabled, treat as no waiting time (hide countdown)
  if (isOpenAllEnabled()) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMilliseconds: 0, nextDay: 24 };
  }
  // Use the user's local time for both comparisons and differences
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based, December = 11
  const currentDay = now.getDate();

  // If not December yet, return time until December 1
  if (currentMonth < 11) {
    const dec1 = new Date(currentYear, 11, 1, 0, 0, 0);
    const diff = dec1.getTime() - now.getTime();

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      totalMilliseconds: diff,
      nextDay: 1
    };
  }

  // If December, find next unlock day
  let nextDay = currentDay + 1;

  // If past December 24, no more unlocks
  if (currentDay >= 24) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMilliseconds: 0,
      nextDay: 24
    };
  }

  // Calculate time until next day at 00:00:01 local time
  const nextUnlock = getDayUnlockTime(nextDay, currentYear);
  const diff = nextUnlock.getTime() - now.getTime();

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    totalMilliseconds: diff,
    nextDay
  };
};

/**
 * Get current day in December (local timezone)
 * Returns 0 if not December
 */
export const getCurrentDecemberDay = (): number => {
  const currentLocal = getCurrentLocalDate();

  if (currentLocal.getMonth() !== 11) {
    return 0; // Not December
  }

  return currentLocal.getDate();
};
