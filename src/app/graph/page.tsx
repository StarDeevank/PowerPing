
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
          <RealTimeGraph />
        </div>
      </main>
    </div>
  );
}
