import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Settings, Zap, PlusCircle, SlidersHorizontal, HomeIcon } from 'lucide-react';

interface SiteHeaderProps {
  onOpenHomeConfig: () => void;
  onOpenUsageSettings: () => void;
  onOpenAddAppliance: () => void;
}

const SiteHeader: React.FC<SiteHeaderProps> = ({ onOpenHomeConfig, onOpenUsageSettings, onOpenAddAppliance }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Zap className="h-8 w-8 text-primary" />
          <span className="font-bold text-xl font-headline">WattWatcher AI</span>
        </Link>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onOpenHomeConfig} aria-label="Configure Home">
            <HomeIcon className="mr-2 h-4 w-4" />
            Home Config
          </Button>
          <Button variant="outline" size="sm" onClick={onOpenUsageSettings} aria-label="Usage Settings">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Usage Goals
          </Button>
          <Button variant="default" size="sm" onClick={onOpenAddAppliance} className="bg-accent text-accent-foreground hover:bg-accent/90" aria-label="Add Appliance">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Appliance
          </Button>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
