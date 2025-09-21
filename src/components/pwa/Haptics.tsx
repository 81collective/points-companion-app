"use client";
import { useEffect } from 'react';

export function Haptics() {
  useEffect(() => {
    const onPointer = () => {
      try {
        const nav = navigator as unknown as { vibrate?: (pattern: number | number[]) => boolean }
        if (typeof nav?.vibrate === 'function') nav.vibrate(10)
      } catch {}
    };
    document.addEventListener('touchstart', onPointer as EventListener, { passive: true } as AddEventListenerOptions);
    return () => document.removeEventListener('touchstart', onPointer as EventListener);
  }, []);
  return null;
}
