"use client";
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(()=>{ 
    setMounted(true); 
    try {
      const stored = localStorage.getItem('pc-theme');
      if (stored === 'dark') setDark(true);
    } catch {}
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  },[]);
  useEffect(()=>{
    if (!mounted) return;
    const root = document.documentElement;
  if (dark) root.setAttribute('data-theme','dark'); else root.removeAttribute('data-theme');
  try { localStorage.setItem('pc-theme', dark ? 'dark' : 'light'); } catch {}
  if (reducedMotion) root.style.setProperty('--transition-fast','0ms');
  }, [dark, mounted, reducedMotion]);

  return (
  <button type="button" aria-label="Toggle theme" className="theme-toggle" onClick={()=>setDark(d=>!d)}>
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
