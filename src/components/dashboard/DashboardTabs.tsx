"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface TabDef { key: string; label: string; }
const tabs: TabDef[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'cards', label: 'Cards' },
  { key: 'insights', label: 'Insights' },
  { key: 'analytics', label: 'Analytics' }
];

export default function DashboardTabs({ onChange }: { onChange: (tab: string)=>void }) {
  const router = useRouter();
  const params = useSearchParams();
  const initial = params?.get('tab') || 'overview';
  const [active, setActive] = useState(initial);

  useEffect(()=>{ onChange(active); }, [active, onChange]);

  const handleSelect = (key: string) => {
    setActive(key);
    router.replace(`/dashboard?tab=${key}`);
  };

  return (
    <div role="tablist" aria-label="Dashboard sections" className="flex gap-2 mb-6 overflow-x-auto">
      {tabs.map(t => (
        <button
          key={t.key}
            role="tab"
            aria-selected={active === t.key}
            onClick={()=>handleSelect(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${active===t.key? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}
        >{t.label}</button>
      ))}
    </div>
  );
}
