"use client"

// Deprecated MobileNav component. Use UnifiedDashboardShell integrated drawer instead.
export default function MobileNav(): null {
  if (process.env.NODE_ENV !== 'production') {
    throw new Error('MobileNav is deprecated. Use UnifiedDashboardShell integrated drawer instead.');
  }
  return null;
}
