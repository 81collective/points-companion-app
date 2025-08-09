"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navigationItems } from '@/config/navigation'

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="hidden lg:block w-60 shrink-0 border-r border-gray-200 bg-white">
      <nav className="p-4 space-y-1" aria-label="Sidebar navigation">
        {navigationItems.map((item) => {
          const active = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${active ? 'bg-rose-50 text-rose-600' : 'text-gray-700 hover:bg-gray-50'}`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
