"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navigationItems } from '@/config/navigation'

// Deprecated MobileNav component. Use UnifiedDashboardShell integrated drawer instead.
export default function MobileNav(): null {
  if (process.env.NODE_ENV !== 'production') {
    throw new Error('MobileNav is deprecated. Use UnifiedDashboardShell integrated drawer instead.');
  }
  return null;
}
