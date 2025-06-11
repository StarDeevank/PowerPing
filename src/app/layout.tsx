
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
// import SiteHeader from '@/components/site-header'; // Removed import
import AppInitializer from '@/components/AppInitializer'; // Import new component

export const metadata: Metadata = {
  title: 'PowerPing',
  description: 'Monitor and optimize your energy consumption with PowerPing.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Metadata will be injected by Next.js from the export above */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col bg-background" suppressHydrationWarning={true}>
        <AppInitializer>
          {/* <SiteHeader /> */} {/* SiteHeader component removed */}
          <main className="flex-grow container mx-auto p-4 md:p-6">
            {children}
          </main>
          <Toaster />
        </AppInitializer>
      </body>
    </html>
  );
}
