"use client";
import React, { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Command { id: string; title: string; shortcut?: string; action: () => void; group?: string; }

function buildCommands(router: ReturnType<typeof useRouter>, close: () => void): Command[] {
  const go = (path: string) => () => { router.push(path); close(); };
  return [
    { id: 'nav.overview', title: 'Go to Overview', action: go('/dashboard?tab=overview'), group: 'Navigation' },
    { id: 'nav.cards', title: 'Go to Cards', action: go('/dashboard?tab=cards'), group: 'Navigation' },
    { id: 'nav.insights', title: 'Go to Insights', action: go('/dashboard?tab=insights'), group: 'Navigation' },
    { id: 'nav.analytics', title: 'Go to Analytics', action: go('/dashboard?tab=analytics'), group: 'Navigation' },
    { id: 'nav.bonuses', title: 'Go to Bonuses (Soon)', action: go('/dashboard?tab=bonuses'), group: 'Navigation' },
  ];
}

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const close = useCallback(()=>setOpen(false), []);

  useEffect(()=>{
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      } else if (e.key === 'Escape') { setOpen(false); }
    };
    window.addEventListener('keydown', handler);
    return ()=> window.removeEventListener('keydown', handler);
  }, []);

  const commands = buildCommands(router, close);
  const filtered = query.trim() ? commands.filter(c => c.title.toLowerCase().includes(query.toLowerCase())) : commands;
  if (!open) return null;
  return (
    <div aria-modal="true" role="dialog" className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={close}>
      <div className="w-full max-w-lg rounded-2xl shadow-lg border border-gray-200 bg-white overflow-hidden" onClick={e=>e.stopPropagation()}>
        <div className="border-b border-gray-100 flex items-center px-4">
          <input autoFocus placeholder="Type a command or search (static)" value={query} onChange={e=>setQuery(e.target.value)} className="w-full py-3 text-sm outline-none bg-transparent placeholder:text-gray-400" aria-label="Command palette search" />
          <kbd className="ml-2 text-[10px] px-2 py-1 rounded bg-gray-100 border text-gray-500">Esc</kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 && (<li className="px-4 py-3 text-sm text-gray-500">No matches</li>)}
          {filtered.map(c => (
            <li key={c.id}>
              <button onClick={c.action} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center justify-between">
                <span>{c.title}</span>
                {c.shortcut && <span className="text-[10px] text-gray-400 font-mono">{c.shortcut}</span>}
              </button>
            </li>
          ))}
        </ul>
        <div className="border-t border-gray-100 px-4 py-2 text-[10px] uppercase tracking-wide text-gray-400 bg-gray-50 flex justify-between">
          <span>Command Palette (Static v0)</span>
          <span>Ctrl / Cmd + K</span>
        </div>
      </div>
    </div>
  );
}
