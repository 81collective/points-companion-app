"use client";
import { useEffect } from 'react';

// Force light mode by clearing any dark theme attributes/localStorage.
export function ForceLightMode() {
  useEffect(() => {
    try {
      const root = document.documentElement;
      if (root.getAttribute('data-theme') === 'dark') {
        root.removeAttribute('data-theme');
      }
      if (localStorage.getItem('pc-theme') === 'dark') {
        localStorage.setItem('pc-theme', 'light');
      }
    } catch { /* ignore */ }
  }, []);
  return null;
}

export default ForceLightMode;
