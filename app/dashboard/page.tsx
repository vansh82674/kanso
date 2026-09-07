'use client';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('../../src/App'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-[#09090b] text-zinc-400 font-mono text-xs">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Loading KANSO OS...</span>
      </div>
    </div>
  ),
});

export default function DashboardPage() {
  return <App />;
}
