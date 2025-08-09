"use client"
import Header from '@/components/layout/Header'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import Sidebar from '@/components/layout/Sidebar'
import MobileNav from '@/components/layout/MobileNav'
import React from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Breadcrumbs />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 lg:pb-8">
        <div className="flex gap-8">
          <Sidebar />
          <main className="flex-1 py-4">{children}</main>
        </div>
      </div>
      <MobileNav />
    </div>
  )
}
