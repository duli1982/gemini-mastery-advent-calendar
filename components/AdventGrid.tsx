import React from 'react';
import { Ornament } from './Ornament';
import type { CalendarDay } from '../types';
import { isDayUnlocked } from '../utils/dateUtils';

interface AdventGridProps {
  days: CalendarDay[];
  currentDate: Date;
  openedDays: Set<number>;
  onDayClick: (day: CalendarDay, event?: React.MouseEvent) => void;
  shape: 'bulb' | 'circle';
}

export const AdventGrid: React.FC<AdventGridProps> = ({
  days,
  currentDate,
  openedDays,
  onDayClick,
  shape,
}) => {
  const isDecember = currentDate.getMonth() === 11;
  const today = isDecember ? currentDate.getDate() : 0;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 z-10">
      {/* Grid Container */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6 p-4 sm:p-6 md:p-8 bg-gradient-to-br from-green-900/40 to-red-900/40 backdrop-blur-sm rounded-3xl border-4 border-yellow-500/30 shadow-2xl">
        {days.map((dayInfo) => {
          // Use CET timezone unlock logic
          const isFuture = !isDayUnlocked(dayInfo.day);
          const isOpened = openedDays.has(dayInfo.day);
          const isToday = dayInfo.day === today;

          return (
            <div
              key={dayInfo.day}
              className="flex items-center justify-center aspect-square relative"
            >
              {/* Grid cell with gift box */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Ornament
                  dayInfo={dayInfo}
                  isFuture={isFuture}
                  isOpened={isOpened}
                  isToday={isToday}
                  onClick={(event) => onDayClick(dayInfo, event)}
                  shape={shape}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 text-center text-sm text-gray-300 space-y-1">
        <p className="flex items-center justify-center gap-2">
          <span className="inline-block w-4 h-4 bg-gray-500 rounded"></span>
          <span>Locked</span>
          <span className="mx-2">•</span>
          <span className="inline-block w-4 h-4 bg-gradient-to-br from-red-500 to-red-700 rounded shadow-[0_0_15px_rgba(255,215,0,0.8)]"></span>
          <span>Available</span>
          <span className="mx-2">•</span>
          <span className="inline-block w-4 h-4 bg-gradient-to-br from-red-500 to-red-700 rounded"></span>
          <span>Opened</span>
        </p>
      </div>
    </div>
  );
};
