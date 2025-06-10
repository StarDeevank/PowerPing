
"use client";

import React, { useEffect, useState } from 'react';
import PowerPingLogo from '@/components/icons/PowerPingLogo'; // Updated import
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  onFinished: () => void;
  duration?: number; // Duration splash is visible before starting fade-out
}

const FADE_DURATION_MS = 300; // Duration of fade-in/out animation

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinished, duration = 1000 }) => {
  const [opacity, setOpacity] = useState(0); // Start fully transparent for fade-in

  useEffect(() => {
    // Ensure fade-in transition occurs after initial mount
    const fadeInTimeout = setTimeout(() => {
      setOpacity(1);
    }, 50); // Small delay to ensure CSS transition applies

    const visibilityTimer = setTimeout(() => {
      // Start fade-out
      setOpacity(0);
      // Call onFinished after the fade-out animation completes
      const finishTimer = setTimeout(onFinished, FADE_DURATION_MS);
      return () => clearTimeout(finishTimer);
    }, duration + 50); // Add fade-in delay to overall duration

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
      <PowerPingLogo className="h-20 w-auto mb-6 opacity-90" />
      <p className="text-base font-light text-muted-foreground tracking-wider">
        Made by Deevank
      </p>
    </div>
  );
};

export default SplashScreen;
