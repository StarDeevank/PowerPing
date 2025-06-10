
"use client"; // Ensure this component is a client component

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HomeIcon, SlidersHorizontal, PlusCircle, Zap } from 'lucide-react'; // Adjusted icons
import { Dialog, DialogTrigger } from '@/components/ui/dialog'; // To trigger forms

interface SiteHeaderProps {
  onOpenHomeConfig?: () => void;
  onOpenUsageSettings?: () => void;
  onOpenAddAppliance?: () => void;
}

// Note: The onOpen* props will be passed from the page to control dialog visibility.
// If not passed, the buttons won't trigger dialogs directly from here.
// The page itself will manage Dialog open state and pass DialogTrigger as children to these buttons.

const SiteHeader: React.FC<SiteHeaderProps> = ({ onOpenHomeConfig, onOpenUsageSettings, onOpenAddAppliance }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <Zap className="h-8 w-8 text-primary" />
          <span className="font-bold text-xl font-headline text-foreground">WattWatcher AI</span>
        </Link>
        <div className="flex items-center space-x-2">
          {/*
            The actual DialogTrigger and DialogContent will be managed in page.tsx
            These buttons act as visual triggers, their onClick can be used by the parent page.
          */}
          {onOpenHomeConfig && (
            <Button variant="outline" size="sm" onClick={onOpenHomeConfig} aria-label="Configure Home">
              <HomeIcon className="mr-2 h-4 w-4" />
              Home Config
            </Button>
          )}
          {onOpenUsageSettings && (
            <Button variant="outline" size="sm" onClick={onOpenUsageSettings} aria-label="Usage Settings">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Usage Goals
            </Button>
          )}
          {onOpenAddAppliance && (
            <Button variant="default" size="sm" onClick={onOpenAddAppliance} className="bg-accent text-accent-foreground hover:bg-accent/90" aria-label="Add Appliance">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Appliance
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
