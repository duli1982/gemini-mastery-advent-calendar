/**
 * Utility functions for handling dates and CET timezone
 */

/**
 * Get current date and time in CET (Central European Time) timezone
 */
export const getCurrentCETDate = (): Date => {
  // Get current UTC time
  const now = new Date();

  // Convert to CET timezone (UTC+1, or UTC+2 during DST)
  // Using Intl API for accurate timezone conversion
  const cetTimeString = now.toLocaleString('en-US', {
    timeZone: 'Europe/Paris', // Paris is in CET timezone
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  return new Date(cetTimeString);
};

/**
 * Check if a specific day is unlocked based on CET timezone
 * Day 1 is always available
 * Days 2-24 unlock at 00:01 CET on their respective dates
 *
 * @param day - The day number (1-24)
 * @returns true if the day is unlocked, false otherwise
 */
export const isDayUnlocked = (day: number): boolean => {
  // Day 1 is always available
  if (day === 1) {
    return true;
  }

  const currentCET = getCurrentCETDate();
  const currentYear = currentCET.getFullYear();
  const currentMonth = currentCET.getMonth(); // 0-based, December = 11

  // Only unlock days in December
  if (currentMonth !== 11) {
    return false;
  }

  const currentDay = currentCET.getDate();
  const currentHour = currentCET.getHours();
  const currentMinute = currentCET.getMinutes();

  // If current day is greater than the requested day, it's unlocked
  if (currentDay > day) {
    return true;
  }

  // If it's the same day, check if it's past 00:01
  if (currentDay === day) {
    // Check if time is >= 00:01
    if (currentHour > 0 || (currentHour === 0 && currentMinute >= 1)) {
      return true;
    }
  }

  return false;
};

/**
 * Get the unlock time for a specific day in CET
 * @param day - The day number (1-24)
 * @param year - The year (defaults to current year)
 * @returns Date object representing when the day unlocks
 */
export const getDayUnlockTime = (day: number, year?: number): Date => {
  const currentCET = getCurrentCETDate();
  const unlockYear = year || currentCET.getFullYear();

  // Day 1 unlocks at December 1, 00:00
  if (day === 1) {
    return new Date(`${unlockYear}-12-01T00:00:00+01:00`);
  }

  // Days 2-24 unlock at 00:01
  const dayStr = day.toString().padStart(2, '0');
  return new Date(`${unlockYear}-12-${dayStr}T00:01:00+01:00`);
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
  const currentCET = getCurrentCETDate();
  const currentYear = currentCET.getFullYear();
  const currentMonth = currentCET.getMonth();
  const currentDay = currentCET.getDate();

  // If not December yet, return time until December 1
  if (currentMonth < 11) {
    const dec1 = new Date(`${currentYear}-12-01T00:00:00+01:00`);
    const diff = dec1.getTime() - currentCET.getTime();

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

  // Calculate time until next day at 00:01
  const nextUnlock = getDayUnlockTime(nextDay, currentYear);
  const diff = nextUnlock.getTime() - currentCET.getTime();

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
 * Get current day in December (CET timezone)
 * Returns 0 if not December
 */
export const getCurrentDecemberDay = (): number => {
  const currentCET = getCurrentCETDate();

  if (currentCET.getMonth() !== 11) {
    return 0; // Not December
  }

  return currentCET.getDate();
};
