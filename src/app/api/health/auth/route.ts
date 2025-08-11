import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrlPresent = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKeyPresent = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  let connectivity: 'unknown' | 'ok' | 'error' = 'unknown'
  let connectivityError: string | undefined
  if (supabaseUrlPresent) {
    try {
      const controller = new AbortController()
      const id = setTimeout(() => controller.abort(), 3000)
      await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL as string, { method: 'HEAD', signal: controller.signal })
      clearTimeout(id)
      connectivity = 'ok'
    } catch (err: any) {
      connectivity = 'error'
      connectivityError = err?.message || 'fetch_failed'
    }
  }

  return NextResponse.json({
    ok: supabaseUrlPresent && supabaseKeyPresent,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrlPresent,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseKeyPresent,
    },
    connectivity,
    connectivityError,
    timestamp: new Date().toISOString(),
    note: 'Presence booleans only; no secrets exposed.'
  })
}
