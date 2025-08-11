"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';

const links: Array<{ href: string; label: string }> = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/cards', label: 'Cards' },
  { href: '/insights', label: 'Insights' },
  { href: '/analytics', label: 'Analytics' },
];

export function MinimalHeader() {
  const pathname = usePathname();
  return (
    <header className="app-header">
      <div className="page-container app-header-inner">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Link href="/" className="brand">Points Companion</Link>
          <nav className="nav-links hidden md:flex items-center gap-1">
            {links.map(l => (
              <Link key={l.href} href={l.href} aria-current={pathname === l.href ? 'page' : undefined}>{l.label}</Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
