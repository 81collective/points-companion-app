"use client";
import React from 'react';

interface StatCardProps {
  label: string;
  value?: number | string;
  loading?: boolean;
  className?: string;
}

export function StatCard({ label, value, loading, className = '' }: StatCardProps) {
  return (
    <div className={`group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/50 backdrop-blur p-4 text-center shadow-sm ${className}`}>
      <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium">{label}</p>
      {loading ? (
        <div className="mt-2 h-6 w-14 mx-auto rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
      ) : (
        <p className="mt-1 text-xl font-semibold text-gray-800 dark:text-gray-100 tabular-nums">{value}</p>
      )}
      <div className="absolute inset-px rounded-[11px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gradient-to-br from-primary-500/5 to-primary-600/5" />
    </div>
  );
}

export default StatCard;
