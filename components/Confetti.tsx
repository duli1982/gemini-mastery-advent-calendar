import React, { useMemo } from 'react';

// A single confetti piece component for clarity
const ConfettiPiece: React.FC<{ style: React.CSSProperties }> = ({ style }) => {
  return <div className="confetti-piece" style={style} />;
};

export const Confetti: React.FC = () => {
  // useMemo to prevent re-calculating on every render
  const confettiPieces = useMemo(() => {
    const pieces = [];
    // Festive colors matching the app's palette
    const colors = ['#facc15', '#ef4444', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
    const numPieces = 150;

    for (let i = 0; i < numPieces; i++) {
      const style: React.CSSProperties = {
        left: `${Math.random() * 100}vw`,
        // Vary animation duration for a more natural effect
        animationDuration: `${5 + Math.random() * 5}s`,
        // Stagger the start of the animation
        animationDelay: `${Math.random() * 2}s`,
        backgroundColor: colors[i % colors.length],
        // Random initial rotation and size
        transform: `rotate(${Math.random() * 360}deg)`,
        width: `${8 + Math.random() * 8}px`,
        height: `${5 + Math.random() * 5}px`,
        opacity: 0.9,
      };
      pieces.push(<ConfettiPiece key={i} style={style} />);
    }
    return pieces;
  }, []);

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[100]">
        {confettiPieces}
      </div>
      <style>{`
        @keyframes fall-confetti {
          0% {
            transform: translateY(-10vh) rotateZ(0deg) rotateY(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotateZ(720deg) rotateY(360deg);
            opacity: 0;
          }
        }
        .confetti-piece {
          position: absolute;
          top: -10vh;
          will-change: transform, opacity;
          animation: fall-confetti linear forwards;
        }
      `}</style>
    </>
  );
};