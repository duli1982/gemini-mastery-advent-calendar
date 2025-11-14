import React, { useState, useEffect, useMemo } from 'react';
import { getTimeUntilNextUnlock, getDayUnlockTime } from '../utils/dateUtils';

export const CountdownTimer: React.FC = () => {
  const [timeRemaining, setTimeRemaining] = useState(getTimeUntilNextUnlock());

  useEffect(() => {
    // Update countdown every second
    const interval = setInterval(() => {
      setTimeRemaining(getTimeUntilNextUnlock());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Don't show if no time remaining or past Dec 24
  if (timeRemaining.totalMilliseconds <= 0) {
    return null;
  }

  const { days, hours, minutes, seconds, nextDay } = timeRemaining;

  // Compute the user's local time for the next unlock (local midnight)
  const localUnlockLabel = useMemo(() => {
    try {
      const unlockTime = getDayUnlockTime(nextDay);
      const dtf = new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: undefined,
        hour12: false,
        timeZoneName: 'short',
      });
      return dtf.format(unlockTime); // local timezone by default
    } catch {
      return '';
    }
  }, [nextDay]);

  return (
    <div className="bg-gradient-to-r from-green-800/50 to-red-800/50 backdrop-blur-md rounded-2xl p-4 md:p-6 border-2 border-yellow-500/40 shadow-xl max-w-md mx-auto mb-6">
      <div className="text-center">
        <h3 className="text-yellow-300 font-christmas text-xl md:text-2xl mb-3">
          🎁 Next Gift Unlocks In:
        </h3>

        <div className="flex justify-center gap-2 md:gap-4 mb-2">
          {/* Days */}
          {days > 0 && (
            <div className="flex flex-col items-center bg-black/30 rounded-lg p-2 md:p-3 min-w-[60px] md:min-w-[80px]">
              <span className="text-3xl md:text-4xl font-bold text-white font-mono">
                {days.toString().padStart(2, '0')}
              </span>
              <span className="text-xs md:text-sm text-gray-300 uppercase">
                {days === 1 ? 'Day' : 'Days'}
              </span>
            </div>
          )}

          {/* Hours */}
          <div className="flex flex-col items-center bg-black/30 rounded-lg p-2 md:p-3 min-w-[60px] md:min-w-[80px]">
            <span className="text-3xl md:text-4xl font-bold text-white font-mono">
              {hours.toString().padStart(2, '0')}
            </span>
            <span className="text-xs md:text-sm text-gray-300 uppercase">Hours</span>
          </div>

          {/* Minutes */}
          <div className="flex flex-col items-center bg-black/30 rounded-lg p-2 md:p-3 min-w-[60px] md:min-w-[80px]">
            <span className="text-3xl md:text-4xl font-bold text-white font-mono">
              {minutes.toString().padStart(2, '0')}
            </span>
            <span className="text-xs md:text-sm text-gray-300 uppercase">Minutes</span>
          </div>

          {/* Seconds */}
          <div className="flex flex-col items-center bg-black/30 rounded-lg p-2 md:p-3 min-w-[60px] md:min-w-[80px]">
            <span className="text-3xl md:text-4xl font-bold text-yellow-300 font-mono animate-pulse">
              {seconds.toString().padStart(2, '0')}
            </span>
            <span className="text-xs md:text-sm text-gray-300 uppercase">Seconds</span>
          </div>
        </div>

        <p className="text-sm md:text-base text-gray-200 mt-3">
          🎄 Day <span className="font-bold text-yellow-300">{nextDay}</span> opens at{' '}
          <span className="font-bold text-yellow-300">{localUnlockLabel}</span>
          <span className="text-gray-400"> (your local time, at midnight)</span>
        </p>
      </div>
    </div>
  );
};
