import { create } from 'zustand'

export interface BreadcrumbItem { label: string; href: string }
export interface AppNotification { id: string; title: string; read: boolean; createdAt: string }

interface NavigationState {
  currentPage: string
  breadcrumbs: BreadcrumbItem[]
  sidebarCollapsed: boolean
  mobileMenuOpen: boolean
  searchOpen: boolean
  notifications: AppNotification[]
  setCurrentPage: (page: string) => void
  setBreadcrumbs: (items: BreadcrumbItem[]) => void
  toggleSidebar: () => void
  toggleMobileMenu: () => void
  openSearch: () => void
  closeSearch: () => void
  addNotification: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void
  markNotificationRead: (id: string) => void
  clearNotifications: () => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentPage: 'dashboard',
  breadcrumbs: [],
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  searchOpen: false,
  notifications: [],
  setCurrentPage: (currentPage) => set({ currentPage }),
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
  toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleMobileMenu: () => set(s => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
  addNotification: (data) => set(s => ({ notifications: [{ id: `n_${Date.now()}`, createdAt: new Date().toISOString(), read: false, ...data }, ...s.notifications].slice(0,100) })),
  markNotificationRead: (id) => set(s => ({ notifications: s.notifications.map(n => n.id===id? { ...n, read: true }: n) })),
  clearNotifications: () => set({ notifications: [] })
}))
