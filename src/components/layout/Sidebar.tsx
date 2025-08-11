// Deprecated Sidebar component. Use SideNavCompact instead.
export default function Sidebar(): null {
  if (process.env.NODE_ENV !== 'production') {
    throw new Error('Sidebar is deprecated. Use SideNavCompact instead.');
  }
  return null;
}
