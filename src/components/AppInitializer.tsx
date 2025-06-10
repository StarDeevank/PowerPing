
"use client";

import React, { useState, useEffect } from 'react';
import SplashScreen from '@/components/SplashScreen';

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const [isClient, setIsClient] = useState(false);
  const [isSplashAnimationFinished, setIsSplashAnimationFinished] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the component has mounted.
    setIsClient(true);
  }, []);

  const handleSplashFinished = () => {
    setIsSplashAnimationFinished(true);
  };

  if (!isClient) {
    // Render nothing (or a static placeholder) on the server and on the initial client render pass.
    // This ensures the server and client match before client-specific logic runs.
    return null; 
  }

  if (!isSplashAnimationFinished) {
    // Once the client has mounted (isClient is true), show the splash screen.
    return <SplashScreen onFinished={handleSplashFinished} duration={1000} />;
  }

  // After the splash screen is finished, render the actual application children.
  return <>{children}</>;
};

export default AppInitializer;
