import React, { useState, useEffect } from 'react';
import { getTimeUntilNextUnlock } from '../utils/dateUtils';

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

  return (
    <div className="bg-gradient-to-r from-green-800/50 to-red-800/50 backdrop-blur-md rounded-2xl p-4 md:p-6 border-2 border-yellow-500/40 shadow-xl max-w-md mx-auto mb-6">
      <div className="text-center">
        <h3 className="text-yellow-300 font-christmas text-xl md:text-2xl mb-3">
          ⏰ Next Gift Unlocks In:
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
          🎁 Day <span className="font-bold text-yellow-300">{nextDay}</span> opens at{' '}
          <span className="font-bold text-yellow-300">00:01 CET</span>
        </p>
      </div>
    </div>
  );
};
