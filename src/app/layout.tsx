import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import BottomNavigationBar from '@/components/layout/BottomNavigationBar'; // New import

export const metadata: Metadata = {
  title: 'StayFinder AI', // Updated app name
  description: 'Find your perfect stay with AI-powered insights.', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className=""> {/* Removed default dark class, new theme is light */}
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        {/* SiteHeader removed for mobile-first feel */}
        <main className="flex-grow pb-16 md:pb-0"> {/* Add padding-bottom for bottom nav on mobile */}
          {children}
        </main>
        <BottomNavigationBar /> {/* Added BottomNavigationBar */}
        <Toaster />
      </body>
    </html>
  );
}
