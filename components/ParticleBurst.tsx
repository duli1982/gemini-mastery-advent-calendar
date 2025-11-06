import React, { useEffect, useState } from 'react';

interface ParticleBurstProps {
  x: number;
  y: number;
  onComplete: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  size: number;
  emoji?: string;
}

export const ParticleBurst: React.FC<ParticleBurstProps> = ({ x, y, onComplete }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Create particles
    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731', '#5f27cd', '#00d2d3', '#ff9ff3'];
    const emojis = ['❄️', '⭐', '✨', '🎄', '🎁', '⛄'];

    const newParticles: Particle[] = Array.from({ length: 25 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 25;
      const velocity = 2 + Math.random() * 3;

      return {
        id: i,
        x: 0,
        y: 0,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 8 + Math.random() * 12,
        emoji: Math.random() > 0.5 ? emojis[Math.floor(Math.random() * emojis.length)] : undefined,
      };
    });

    setParticles(newParticles);

    // Animate particles
    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      if (progress < 1) {
        setParticles((prev) =>
          prev.map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy + 0.5, // Gravity
            rotation: p.rotation + p.rotationSpeed,
            vy: p.vy + 0.15, // Gravity acceleration
          }))
        );
        requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    requestAnimationFrame(animate);
  }, [onComplete]);

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: particle.x,
            top: particle.y,
            transform: `translate(-50%, -50%) rotate(${particle.rotation}deg)`,
            opacity: Math.max(0, 1 - particle.y / 300),
          }}
        >
          {particle.emoji ? (
            <span style={{ fontSize: `${particle.size}px` }}>{particle.emoji}</span>
          ) : (
            <div
              style={{
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                boxShadow: `0 0 10px ${particle.color}`,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};
