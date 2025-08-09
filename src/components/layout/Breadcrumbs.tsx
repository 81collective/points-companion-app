"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home } from 'lucide-react'

export default function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  const crumbs = segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    href: '/' + segments.slice(0, i + 1).join('/'),
  }))

  if (crumbs.length === 0) return null

  return (
    <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2">
        <li>
          <Link href="/dashboard" className="inline-flex items-center gap-1 hover:text-gray-900" aria-label="Go to Dashboard">
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </li>
        {crumbs.slice(1).map((c, i, arr) => (
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
