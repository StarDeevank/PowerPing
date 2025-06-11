
"use client";

import React, { useEffect, useState } from 'react';
import PowerPingLogo from '@/components/icons/PowerPingLogo';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  onFinished: () => void;
  duration?: number; // Duration splash is visible before starting fade-out
}

const FADE_DURATION_MS = 300; // Duration of fade-in/out animation

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinished, duration = 1500 }) => { // Adjusted duration
  const [opacity, setOpacity] = useState(0); // Start fully transparent for fade-in

  useEffect(() => {
    const fadeInTimeout = setTimeout(() => {
      setOpacity(1);
    }, 50); 

    const visibilityTimer = setTimeout(() => {
      setOpacity(0);
      const finishTimer = setTimeout(onFinished, FADE_DURATION_MS);
      return () => clearTimeout(finishTimer);
    }, duration + 50); 

    return () => {
      clearTimeout(fadeInTimeout);
      clearTimeout(visibilityTimer);
    };
  }, [duration, onFinished]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-background",
        "transition-opacity ease-in-out"
      )}
      style={{ opacity: opacity, transitionDuration: `${FADE_DURATION_MS}ms` }}
    >
      <PowerPingLogo className="h-20 w-auto opacity-90" />
    </div>
  );
};

export default SplashScreen;
