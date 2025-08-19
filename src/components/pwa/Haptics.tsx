"use client";
import { useEffect } from 'react';

export function Haptics() {
  useEffect(() => {
    const onPointer = () => {
      try {
        if (typeof navigator !== 'undefined') {
          const nav = navigator as unknown as { vibrate?: (pattern: number | number[]) => boolean }
          if (typeof nav?.vibrate === 'function') nav.vibrate(10)
        }
      } catch {}
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('touchstart', onPointer as EventListener, { passive: true } as AddEventListenerOptions);
      return () => document.removeEventListener('touchstart', onPointer as EventListener);
    }
    return () => {};
  }, []);
  return null;
}
