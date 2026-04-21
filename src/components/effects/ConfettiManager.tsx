'use client';

import confetti from 'canvas-confetti';

/**
 * Confetti Manager
 * Specialized in brand-consistent Blue/White celebratory effects.
 */
export const triggerSuccessConfetti = () => {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: any) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
      colors: ['#3b82f6', '#ffffff', '#60a5fa'], // Blue, White, Light Blue
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};

export default function ConfettiManager() {
    return null; // Side-effect only component
}
