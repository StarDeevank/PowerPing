
"use client";

import React, { useEffect, useState } from 'react';
import PowerPingLogo from '@/components/icons/PowerPingLogo';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  onFinished: () => void;
  duration?: number; // Duration splash is visible before starting fade-out
}

const FADE_DURATION_MS = 300; // Duration of fade-in/out animation

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinished, duration = 2500 }) => { // Increased duration for credits
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
        "fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-background text-center", // Added text-center
        "transition-opacity ease-in-out"
      )}
      style={{ opacity: opacity, transitionDuration: `${FADE_DURATION_MS}ms` }}
    >
      <PowerPingLogo className="h-20 w-auto mb-6 opacity-90" />
      <div className="text-xs font-light text-muted-foreground tracking-wider space-y-1 px-4">
        <p className="font-semibold text-sm text-foreground/90">🔖 Credits:</p>
        <p>Concept and Design by Deevank, Class X-C</p>
        <p>St. Joseph’s Sr. Sec. School, Sector 44D, Chandigarh</p>
        <p>Created for Holiday Homework (AI Project) – 2025–26</p>
      </div>
    </div>
  );
};

export default SplashScreen;
