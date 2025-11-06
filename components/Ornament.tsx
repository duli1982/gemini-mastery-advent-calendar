import React from 'react';
import type { CalendarDay } from '../types';

interface OrnamentProps {
  dayInfo: CalendarDay;
  isFuture: boolean;
  isOpened: boolean;
  isToday: boolean;
  onClick: (event: React.MouseEvent) => void;
  shape: 'bulb' | 'circle';
}

export const Ornament: React.FC<OrnamentProps> = ({ dayInfo, isFuture, isOpened, isToday, onClick }) => {
  const { day, position } = dayInfo;
  const [isUnwrapping, setIsUnwrapping] = React.useState(false);

  // Gift box colors - festive palette
  const giftColors = [
    { box: '#c41e3a', ribbon: '#ffd700' }, // Red with gold
    { box: '#1e7ac4', ribbon: '#ffffff' }, // Blue with white
    { box: '#2d862d', ribbon: '#c41e3a' }, // Green with red
    { box: '#8b4789', ribbon: '#ffd700' }, // Purple with gold
    { box: '#d4af37', ribbon: '#c41e3a' }, // Gold with red
    { box: '#ff69b4', ribbon: '#ffffff' }, // Pink with white
    { box: '#4169e1', ribbon: '#ffd700' }, // Royal blue with gold
  ];
  const colorScheme = giftColors[day % giftColors.length];

  // Check if we're using tree positioning or grid positioning
  const useTreePosition = position && position.top && position.left;

  let baseClasses = 'transition-all duration-300 transform gift-box';

  // Add absolute positioning classes only for tree layout
  if (useTreePosition) {
    baseClasses = 'absolute -translate-x-1/2 -translate-y-1/2 ' + baseClasses;
  }

  if (isFuture) {
    baseClasses += ' cursor-not-allowed opacity-60 grayscale';
  } else {
    baseClasses += ' cursor-pointer hover:scale-110';
    if (isToday) {
      baseClasses += ' animate-pulse-glow';
    }
  }

  const boxStyle: React.CSSProperties = {};

  // Apply tree positioning only if available
  if (useTreePosition) {
    boxStyle.top = position.top;
    boxStyle.left = position.left;
  }

  if (isOpened) {
    boxStyle.filter = 'drop-shadow(0 0 12px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 20px rgba(255, 215, 0, 0.5))';
  }

  const handleClick = (event: React.MouseEvent) => {
    if (isFuture) return;

    // Trigger unwrap animation
    setIsUnwrapping(true);

    // Call parent onClick after animation
    setTimeout(() => {
      onClick(event);
      setIsUnwrapping(false);
    }, 800);
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isFuture || isUnwrapping}
        className={`${baseClasses} ${isUnwrapping ? 'animate-unwrap' : ''}`}
        style={boxStyle}
        aria-label={`Open day ${day}`}
      >
        <div className={`relative w-14 h-14 md:w-16 md:h-16 ${isUnwrapping ? 'unwrap-container' : ''}`}>
          {/* Gift Box Base */}
          <div
            className="absolute inset-0 rounded-md shadow-xl"
            style={{
              backgroundColor: isFuture ? '#6b7280' : colorScheme.box,
              boxShadow: '0 4px 6px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(0,0,0,0.2), inset 2px 2px 4px rgba(255,255,255,0.2)'
            }}
          >
            {/* Shine effect */}
            {!isFuture && (
              <div
                className="absolute top-1 left-1 w-6 h-6 md:w-7 md:h-7 rounded-full opacity-30"
                style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)' }}
              />
            )}
          </div>

          {/* Vertical Ribbon */}
          <div
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-4 md:w-5 h-full shadow-md ribbon-vertical ${isUnwrapping ? 'ribbon-unwrap-v' : ''}`}
            style={{
              backgroundColor: isFuture ? '#9ca3af' : colorScheme.ribbon,
              boxShadow: 'inset -1px 0 2px rgba(0,0,0,0.3), inset 1px 0 2px rgba(255,255,255,0.3)'
            }}
          />

          {/* Horizontal Ribbon */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 left-0 h-4 md:h-5 w-full shadow-md ribbon-horizontal ${isUnwrapping ? 'ribbon-unwrap-h' : ''}`}
            style={{
              backgroundColor: isFuture ? '#9ca3af' : colorScheme.ribbon,
              boxShadow: 'inset 0 -1px 2px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.3)'
            }}
          />

          {/* Bow on top */}
          <div className={`absolute -top-2 left-1/2 -translate-x-1/2 z-10 bow ${isUnwrapping ? 'bow-unwrap' : ''}`}>
            {/* Bow loops */}
            <div className="relative flex gap-0.5">
              <div
                className="w-3 h-4 md:w-4 md:h-5 rounded-full"
                style={{
                  backgroundColor: isFuture ? '#9ca3af' : colorScheme.ribbon,
                  clipPath: 'ellipse(50% 60% at 80% 50%)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              />
              <div
                className="w-3 h-4 md:w-4 md:h-5 rounded-full"
                style={{
                  backgroundColor: isFuture ? '#9ca3af' : colorScheme.ribbon,
                  clipPath: 'ellipse(50% 60% at 20% 50%)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              />
            </div>
            {/* Bow center knot */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
              style={{
                backgroundColor: isFuture ? '#9ca3af' : colorScheme.ribbon,
                boxShadow: '0 2px 3px rgba(0,0,0,0.4)'
              }}
            />
          </div>

          {/* Day Number - on a tag */}
          <div
            className="absolute bottom-0 right-0 bg-white rounded-sm shadow-lg px-1.5 py-0.5 md:px-2 md:py-1 border border-gray-200 z-20"
            style={{ transform: 'rotate(-5deg)' }}
          >
            <span className="text-gray-800 font-bold text-sm md:text-base font-christmas">
              {day}
            </span>
          </div>

          {/* Sparkles for opened gifts */}
          {isOpened && !isFuture && (
            <>
              <div className="sparkle" style={{ top: '-2px', left: '-2px' }}>✨</div>
              <div className="sparkle" style={{ top: '-2px', right: '-2px', animationDelay: '0.3s' }}>✨</div>
              <div className="sparkle" style={{ bottom: '-2px', left: '-2px', animationDelay: '0.6s' }}>✨</div>
              <div className="sparkle" style={{ bottom: '-2px', right: '-2px', animationDelay: '0.9s' }}>✨</div>
            </>
          )}
        </div>
      </button>
      <style>{`
        .gift-box {
          perspective: 1000px;
        }

        .sparkle {
          position: absolute;
          font-size: 10px;
          animation: sparkle-twinkle 2s infinite;
          pointer-events: none;
        }

        @keyframes sparkle-twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.2) rotate(180deg);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.5));
          }
          50% {
            transform: translate(-50%, -50%) scale(1.08);
            filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.9));
          }
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s infinite;
        }

        /* Unwrap Animations */
        @keyframes unwrap-shake {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-5deg) scale(1.05); }
          50% { transform: rotate(5deg) scale(1.1); }
          75% { transform: rotate(-5deg) scale(1.05); }
        }

        @keyframes ribbon-slide-vertical {
          0% { transform: translateX(-50%) scaleY(1); opacity: 1; }
          100% { transform: translateX(-50%) translateY(-100px) scaleY(0.5); opacity: 0; }
        }

        @keyframes ribbon-slide-horizontal {
          0% { transform: translateY(-50%) scaleX(1); opacity: 1; }
          100% { transform: translateY(-50%) translateX(-100px) scaleX(0.5); opacity: 0; }
        }

        @keyframes bow-fly-away {
          0% { transform: translate(-50%, 0) scale(1) rotate(0deg); opacity: 1; }
          100% { transform: translate(-50%, -80px) scale(0.3) rotate(720deg); opacity: 0; }
        }

        @keyframes lid-open {
          0% { transform: perspective(500px) rotateX(0deg); }
          100% { transform: perspective(500px) rotateX(-120deg); transform-origin: bottom; }
        }

        .animate-unwrap {
          animation: unwrap-shake 0.8s ease-in-out;
        }

        .ribbon-unwrap-v {
          animation: ribbon-slide-vertical 0.6s ease-out forwards;
          animation-delay: 0.2s;
        }

        .ribbon-unwrap-h {
          animation: ribbon-slide-horizontal 0.6s ease-out forwards;
          animation-delay: 0.3s;
        }

        .bow-unwrap {
          animation: bow-fly-away 0.7s ease-out forwards;
          animation-delay: 0.1s;
        }

        .unwrap-container {
          animation: unwrap-shake 0.8s ease-in-out;
        }
      `}</style>
    </>
  );
};