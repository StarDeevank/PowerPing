"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import WattWatcherLogo from '@/components/icons/WattWatcherLogo'; // New Logo

interface SiteHeaderProps {
  isSleepModeActive?: boolean;
  onToggleSleepMode?: () => void;
  // Removed props for dialog openers as they will be handled within tabs
}

const SiteHeader: React.FC<SiteHeaderProps> = ({
  isSleepModeActive,
  onToggleSleepMode
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 mb-6">
      <div className="container flex h-20 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <WattWatcherLogo className="h-10 w-auto" /> {/* Use new logo */}
          <span className="font-bold text-xl font-headline text-foreground">WattWatcher AI</span>
        </Link>
        <div className="flex items-center space-x-2">
           {onToggleSleepMode && (
            <Button variant="outline" size="sm" onClick={onToggleSleepMode} aria-label={isSleepModeActive ? "Deactivate Sleep Mode" : "Activate Sleep Mode"}>
              {isSleepModeActive ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
              {isSleepModeActive ? 'Awake Mode' : 'Sleep Mode'}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
