import { Home, CreditCard, Settings } from 'lucide-react'

export type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export const navigationItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'My Cards', href: '/dashboard/cards', icon: CreditCard },
  { label: 'Profile', href: '/dashboard/profile', icon: Settings },
]
