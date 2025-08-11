import UnifiedDashboardShell from '@/components/layout/UnifiedDashboardShell'

export default function DashboardRouteLayout({ children }: { children: React.ReactNode }) {
  return <UnifiedDashboardShell>{children}</UnifiedDashboardShell>
}
