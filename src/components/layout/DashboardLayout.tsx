"use client"
import Header from '@/components/layout/Header'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import Sidebar from '@/components/layout/Sidebar'
import MobileNav from '@/components/layout/MobileNav'
import React from 'react'
import { useNavigationStore } from '@/stores/navigationStore'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { setCurrentPage, sidebarCollapsed } = useNavigationStore()

  React.useEffect(() => {
    const page = pathname.split('/').filter(Boolean).slice(-1)[0] || 'dashboard'
    setCurrentPage(page)
  }, [pathname, setCurrentPage])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Breadcrumbs />
      </div>
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-24 lg:pb-8 flex-1 flex">
        <div className="flex gap-8 w-full">
          <Sidebar collapsed={sidebarCollapsed} />
          <main className="flex-1 py-4 min-w-0">{children}</main>
        </div>
      </div>
      <MobileNav />
    </div>
  )
}
