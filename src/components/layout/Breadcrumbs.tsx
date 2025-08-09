"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home } from 'lucide-react'
import { useNavigationStore } from '@/stores/navigationStore'

export default function Breadcrumbs() {
  const pathname = usePathname()
  const { breadcrumbs, setBreadcrumbs } = useNavigationStore()

  // derive & sync breadcrumbs when path changes
  React.useEffect(() => {
    const segments = pathname.split('/').filter(Boolean)
    const computed = segments.map((seg, i) => ({
      label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
      href: '/' + segments.slice(0, i + 1).join('/'),
    }))
    setBreadcrumbs(computed)
  }, [pathname, setBreadcrumbs])

  if (!breadcrumbs.length) return null

  return (
    <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2">
        <li>
          <Link href="/dashboard" className="inline-flex items-center gap-1 hover:text-gray-900" aria-label="Go to Dashboard">
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </li>
        {breadcrumbs.slice(1).map((c, i, arr) => (
          <li key={c.href} className="flex items-center gap-2">
            <span aria-hidden>/</span>
            {i === arr.length - 1 ? (
              <span aria-current="page" className="text-gray-700">{c.label}</span>
            ) : (
              <Link href={c.href} className="hover:text-gray-900">{c.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
