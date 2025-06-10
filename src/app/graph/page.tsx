
// This page is no longer part of the PowerPing application.
// It was related to the previous Airbnb-style UI.
// To re-enable, ensure it's linked appropriately and fits the app's context.

import RealTimeGraph from '@/components/graphs/RealTimeGraph';
import SectionTitle from '@/components/common/SectionTitle';

export default function GraphPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 min-h-screen">
      <header className="mb-6">
        <SectionTitle>Live Data Graph</SectionTitle>
        <p className="text-muted-foreground">
          This page demonstrates a real-time updating graph component.
        </p>
      </header>
      
      <main className="flex flex-col items-center">
        <div className="w-full max-w-3xl">
          {/* <RealTimeGraph /> */}
          <p className="text-center text-muted-foreground p-8">Graph component placeholder. This feature is currently inactive.</p>
        </div>
      </main>
    </div>
  );
}
