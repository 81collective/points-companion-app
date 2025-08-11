// Deprecated DashboardLayout: replaced by UnifiedDashboardShell
// This stub intentionally throws in development if imported.
export default function DashboardLayout(): null {
  if (process.env.NODE_ENV !== 'production') {
    throw new Error('DashboardLayout is deprecated. Use UnifiedDashboardShell instead.');
  }
  return null;
}
