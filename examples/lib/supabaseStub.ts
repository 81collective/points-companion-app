let warned = false;

export function useSupabase() {
  if (!warned && typeof console !== 'undefined') {
    console.warn('[examples] Supabase client removed. These demos now run in offline mode—replace useSupabase with your realtime backend before using them in production.');
    warned = true;
  }

  return {
    supabase: null as unknown
  };
}
