
"use client";

import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

interface SiteHeaderProps {
  isSleepModeActive?: boolean;
  onToggleSleepMode?: () => void;
}

const SiteHeader: React.FC<SiteHeaderProps> = ({
  isSleepModeActive,
  onToggleSleepMode
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 mb-6">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-end px-4 md:px-6"> {/* Content aligned to the right */}
        {/* Logo and App Name Link removed */}
        <div className="flex items-center space-x-2">
           {onToggleSleepMode && ( // Only show if onToggleSleepMode is provided (i.e., when used on page.tsx)
            <Button variant="outline" size="sm" onClick={onToggleSleepMode} aria-label={isSleepModeActive ? "Deactivate Sleep Mode" : "Activate Sleep Mode"}>
              {isSleepModeActive ? <Sun className="h-4 w-4 sm:mr-2" /> : <Moon className="h-4 w-4 sm:mr-2" />}
              <span className="hidden sm:inline">{isSleepModeActive ? 'Awake Mode' : 'Sleep Mode'}</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
