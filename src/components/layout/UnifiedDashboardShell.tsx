"use client";
import React from 'react';
import TopBarMinimal from '@/components/layout/TopBarMinimal';
import SideNavCompact from '@/components/layout/SideNavCompact';
import { useNavigationStore } from '@/stores/navigationStore';

export default function UnifiedDashboardShell({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useNavigationStore();
  const [mobileOpen, setMobileOpen] = React.useState(false);

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
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="w-60 bg-white h-full shadow-xl">
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
