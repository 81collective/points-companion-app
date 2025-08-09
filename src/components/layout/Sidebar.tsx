"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navigationItems } from '@/config/navigation'
import { useNavigationStore } from '@/stores/navigationStore'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Sidebar({ collapsed }: { collapsed?: boolean }) {
  const pathname = usePathname()
  const { toggleSidebar } = useNavigationStore()
  return (
    <aside className={`hidden lg:flex flex-col ${collapsed ? 'w-16' : 'w-60'} transition-all duration-200 shrink-0 border-r border-gray-200 bg-white`}>      
      <div className="p-2 flex justify-end">
        <button onClick={toggleSidebar} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} className="p-2 rounded-md hover:bg-gray-50 text-gray-500">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
      <nav className="px-2 pb-4 space-y-1 flex-1 overflow-y-auto" aria-label="Sidebar navigation">
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
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
