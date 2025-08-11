"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Augment window for debug flag
declare global {
  interface Window { __AUTH_DEBUG?: boolean }
}

export default function AuthDiagnostics() {
  const { user, loading, profile } = useAuth();
  const [visible, setVisible] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(()=>{
    const params = new URLSearchParams(window.location.search);
    if (params.get('debug-auth') === '1') {
      window.__AUTH_DEBUG = true;
      setVisible(true);
    }
  }, []);

  useEffect(()=>{
    if (!visible) return;
    const id = setInterval(()=> setNow(Date.now()), 3000);
    return ()=> clearInterval(id);
  }, [visible]);

  if (!visible) return null;

  return (
    <div style={{position:'fixed',bottom:8,right:8,zIndex:9999,fontFamily:'monospace'}} className="max-w-sm text-xs bg-black/80 text-green-300 p-3 rounded-lg shadow-lg space-y-1">
      <div className="flex justify-between items-center">
        <strong className="text-green-400">AuthDiag</strong>
        <button onClick={()=>setVisible(false)} className="text-red-300 hover:text-red-200">×</button>
      </div>
      <div>ts: {new Date(now).toLocaleTimeString()}</div>
      <div>loading: {String(loading)}</div>
      <div>user: {user ? user.id : 'null'}</div>
      <div>profile: {profile ? 'yes' : 'no'}</div>
      <div>path: {typeof window !== 'undefined' ? window.location.pathname : ''}</div>
    </div>
  );
}
