"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface TabDef { key: string; label: string; }
const tabs: TabDef[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'cards', label: 'Cards' },
  { key: 'bonuses', label: 'Bonuses' },
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

  // Keyboard navigation: Left/Right or Ctrl+Alt+Arrow
  const onKeyDown = (e: React.KeyboardEvent) => {
    const idx = tabs.findIndex(t=>t.key===active);
    if (idx === -1) return;
    const nav = (nextIdx: number) => { const t = tabs[(nextIdx+tabs.length)%tabs.length]; handleSelect(t.key); };
    const isCtrlAlt = e.ctrlKey && e.altKey;
    if (e.key === 'ArrowRight' && !isCtrlAlt) { e.preventDefault(); nav(idx+1); }
    else if (e.key === 'ArrowLeft' && !isCtrlAlt) { e.preventDefault(); nav(idx-1); }
    else if (isCtrlAlt && e.key === 'ArrowRight') { e.preventDefault(); nav(idx+1); }
    else if (isCtrlAlt && e.key === 'ArrowLeft') { e.preventDefault(); nav(idx-1); }
  };

  return (
    <div role="tablist" aria-label="Dashboard sections" className="flex gap-2 mb-6 overflow-x-auto" onKeyDown={onKeyDown}>
      {tabs.map(t => (
        <button
          key={t.key}
          role="tab"
          tabIndex={active === t.key ? 0 : -1}
          aria-selected={active === t.key}
          onClick={()=>handleSelect(t.key)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 ${active===t.key? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}
        >{t.label}</button>
      ))}
    </div>
  );
}
