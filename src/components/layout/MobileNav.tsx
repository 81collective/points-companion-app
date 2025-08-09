"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navigationItems } from '@/config/navigation'

export default function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60" role="navigation" aria-label="Bottom navigation">
      <ul className="grid grid-cols-4">
        {navigationItems.map((item) => {
          const active = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <li key={item.href} className="flex">
              <Link
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs transition-colors ${active ? 'text-rose-600' : 'text-gray-600 hover:text-gray-900'}`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
