import React from 'react';
import { useApp } from '../../context/AppContext';

export default function ConfettiOverlay() {
  const app = useApp();

  if (!app.showConfetti) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
      {app.confettiParticles.map((p) => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.x}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '0%',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
