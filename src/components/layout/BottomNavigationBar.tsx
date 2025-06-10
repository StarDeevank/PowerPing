
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Briefcase, MessageSquareText, UserCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/trips', label: 'Trips', icon: Briefcase },
  { href: '/inbox', label: 'Inbox', icon: MessageSquareText },
  { href: '/profile', label: 'Profile', icon: UserCircle2 },
];

export default function BottomNavigationBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <div className="container mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 p-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className={cn("h-6 w-6", isActive ? "text-primary" : "")} />
              <span className={cn("text-xs", isActive ? "text-primary font-semibold" : "")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
