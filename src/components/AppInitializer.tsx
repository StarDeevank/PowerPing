
"use client";

import React, { useState, useEffect } from 'react';
import SplashScreen from '@/components/SplashScreen';

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const [showSplash, setShowSplash] = useState(true);

  // This component only needs to manage the splash screen state.
  // The actual timing and fade-out logic is handled within SplashScreen.tsx.
  // When onFinished is called by SplashScreen, we hide it and show children.

  if (showSplash) {
    // The body needs to be available for SplashScreen to mount correctly
    // We return the splash screen directly, it will cover the viewport.
    return <SplashScreen onFinished={() => setShowSplash(false)} duration={1000} />;
  }

  return <>{children}</>;
};

export default AppInitializer;
