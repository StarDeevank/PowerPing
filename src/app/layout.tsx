import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import SiteHeader from '@/components/site-header'; // WattWatcher specific header

export const metadata: Metadata = {
  title: 'WattWatcher AI', 
  description: 'Monitor and optimize your energy consumption with AI-powered insights.', 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark"> {/* Apply dark class globally */}
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col bg-background">
        <SiteHeader /> {/* Using a dedicated header for WattWatcher */}
        <main className="flex-grow container mx-auto p-4 md:p-6"> 
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
