"use client";
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(()=>{ setMounted(true); },[]);
  useEffect(()=>{
    if (!mounted) return;
    const root = document.documentElement;
    if (dark) root.setAttribute('data-theme','dark'); else root.removeAttribute('data-theme');
  }, [dark, mounted]);

  return (
    <button type="button" aria-label="Toggle theme" className="theme-toggle" onClick={()=>setDark(d=>!d)}>
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
