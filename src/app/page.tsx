import { TileTrackerClient } from '@/components/tile-tracker-client';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <TileTrackerClient />
    </main>
  );
}
