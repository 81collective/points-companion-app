import { create } from 'zustand'

export interface BreadcrumbItem { label: string; href: string }
export interface AppNotification { id: string; title: string; read: boolean; createdAt: string }

interface NavigationState {
  currentPage: string
  sidebarCollapsed: boolean
  mobileMenuOpen: boolean
  searchOpen: boolean
  notifications: AppNotification[]
  setCurrentPage: (page: string) => void
  setSidebarCollapsed: (v: boolean) => void
  toggleSidebar: () => void
  toggleMobileMenu: () => void
  openSearch: () => void
  closeSearch: () => void
  addNotification: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void
  markNotificationRead: (id: string) => void
  clearNotifications: () => void
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  currentPage: 'dashboard',
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  searchOpen: false,
  notifications: [],
  setCurrentPage: (currentPage) => set({ currentPage }),
  setSidebarCollapsed: (v) => set(() => {
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('sidebarCollapsed', JSON.stringify(v)); } catch { /* ignore */ }
    }
    return { sidebarCollapsed: v };
  }),
  toggleSidebar: () => set(s => {
    const next = !s.sidebarCollapsed;
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('sidebarCollapsed', JSON.stringify(next)); } catch { /* ignore */ }
    }
    return { sidebarCollapsed: next };
  }),
  toggleMobileMenu: () => set(s => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
  addNotification: (data) => set(s => ({ notifications: [{ id: `n_${Date.now()}`, createdAt: new Date().toISOString(), read: false, ...data }, ...s.notifications].slice(0,100) })),
  markNotificationRead: (id) => set(s => ({ notifications: s.notifications.map(n => n.id===id? { ...n, read: true }: n) })),
  clearNotifications: () => set({ notifications: [] })
}))

// Hydrate sidebar collapsed preference once on the client (idempotent)
if (typeof window !== 'undefined') {
  try {
    const raw = localStorage.getItem('sidebarCollapsed');
    if (raw != null) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'boolean') {
        useNavigationStore.setState({ sidebarCollapsed: parsed });
      }
    }
  } catch { /* ignore */ }
}
