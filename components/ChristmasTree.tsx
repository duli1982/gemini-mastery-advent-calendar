import React from 'react';
import type { CalendarDay } from '../types';
import { Ornament } from './Ornament';
import { StarIcon } from './icons/StarIcon';

interface ChristmasTreeProps {
  days: CalendarDay[];
  currentDate: Date;
  openedDays: Set<number>;
  onDayClick: (day: CalendarDay) => void;
  shape: 'bulb' | 'circle';
}

export const ChristmasTree: React.FC<ChristmasTreeProps> = ({ days, currentDate, openedDays, onDayClick, shape }) => {
  const isDecember = currentDate.getMonth() === 11;
  const today = isDecember ? currentDate.getDate() : -1; // Only active in December

  return (
    <div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg mx-auto aspect-[3/4] my-auto">
      {/* Tree SVG Background */}
      <svg viewBox="0 0 300 400" className="absolute inset-0 w-full h-full drop-shadow-2xl">
        <defs>
            <linearGradient id="treeGradient" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#15803d" />
                <stop offset="100%" stopColor="#14532d" />
            </linearGradient>
             <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#000" floodOpacity="0.4"/>
            </filter>
        </defs>
        
        {/* Trunk */}
        <rect x="135" y="350" width="30" height="40" fill="#5C4033" />
        
        {/* Tree Layers */}
        <g style={{filter: 'url(#shadow)'}}>
            <path d="M150 10 L 290 350 L 10 350 Z" fill="#166534" />
            <path d="M150 15 L 260 300 L 40 300 Z" fill="#15803d" />
            <path d="M150 20 L 230 250 L 70 250 Z" fill="#22c55e" />
            <path d="M150 25 L 200 200 L 100 200 Z" fill="#4ade80" />
        </g>
      </svg>
      
      {/* Star Topper */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16" style={{ top: '-2%' }}>
        <StarIcon />
      </div>

      {/* Ornaments */}
      {days.map((dayInfo) => {
        const isFuture = dayInfo.day > today;
        const isToday = dayInfo.day === today;
        
        return (
          <Ornament
            key={dayInfo.day}
            dayInfo={dayInfo}
            isFuture={isFuture}
            isOpened={openedDays.has(dayInfo.day)}
            isToday={isToday}
            onClick={() => onDayClick(dayInfo)}
            shape={shape}
          />
        );
      })}
    </div>
  );
};