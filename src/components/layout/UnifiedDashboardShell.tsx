"use client";
import React from 'react';
import TopBarMinimal from '@/components/layout/TopBarMinimal';
import SideNavCompact from '@/components/layout/SideNavCompact';
import { useNavigationStore } from '@/stores/navigationStore';

export default function UnifiedDashboardShell({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useNavigationStore();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const drawerRef = React.useRef<HTMLDivElement | null>(null);

  // Close on ESC
  React.useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  // Basic focus trap when drawer open
  React.useEffect(() => {
    const node = drawerRef.current;
    if (!mobileOpen || !node) return;
    const focusable = node.querySelectorAll<HTMLElement>("a,button,[tabindex]:not([tabindex='-1'])");
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const previouslyFocused = document.activeElement as HTMLElement | null;
    first?.focus();
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); (last || first).focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); (first || last).focus(); }
      }
    }
    node.addEventListener('keydown', handleKey);
    return () => {
      node.removeEventListener('keydown', handleKey);
      previouslyFocused?.focus();
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <TopBarMinimal onMobileMenuToggle={() => setMobileOpen(o => !o)} mobileMenuOpen={mobileOpen} />
      <div className="flex flex-1 relative">
        {/* Desktop sidebar */}
        <div className={`hidden md:block transition-all duration-200 ${sidebarCollapsed ? 'w-16' : 'w-60'}`}>
          <SideNavCompact />
        </div>
        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex" aria-modal="true" role="dialog">
            <div ref={drawerRef} className="w-60 bg-white dark:bg-gray-900 h-full shadow-xl outline-none" tabIndex={-1}>
              <SideNavCompact mobile onNavigate={() => setMobileOpen(false)} />
            </div>
            <button
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
              className="flex-1 bg-black/30 backdrop-blur-sm"
            />
          </div>
        )}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
