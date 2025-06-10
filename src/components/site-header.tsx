
"use client";

import Link from 'next/link';
import PowerPingLogo from '@/components/icons/PowerPingLogo';
// Removed Button, Moon, Sun imports as they are no longer used here

// SiteHeaderProps is no longer needed as props are removed
// interface SiteHeaderProps {
//   isSleepModeActive?: boolean;
//   onToggleSleepMode?: () => void;
// }

const SiteHeader: React.FC = () => { // Props removed
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 mb-6">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6"> {/* Changed to justify-between */}
        <Link href="/" className="flex items-center space-x-2">
          <PowerPingLogo className="h-7 w-auto" />
          <span className="font-semibold text-lg text-foreground">PowerPing</span>
        </Link>
        {/* Sleep mode toggle has been moved to page.tsx where its state is managed */}
        {/* Other global header items could be placed on the right side here if needed in the future */}
      </div>
    </header>
  );
};

export default SiteHeader;

