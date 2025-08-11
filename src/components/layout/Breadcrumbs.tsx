// Deprecated Breadcrumbs component: no longer used (navigation simplified).
// Keeping a harmless stub for any lingering imports; throws in development.
export default function Breadcrumbs(): null {
  if (process.env.NODE_ENV !== 'production') {
    throw new Error('Breadcrumbs component is deprecated and should be removed.');
  }
  return null;
}
