import { NextResponse } from 'next/server'

export async function GET() {
  const nextAuthSecretPresent = Boolean(process.env.NEXTAUTH_SECRET)
  const nextAuthUrlPresent = Boolean(process.env.NEXTAUTH_URL)
  const databaseUrlPresent = Boolean(process.env.DATABASE_URL)

  let connectivity: 'unknown' | 'ok' | 'error' = 'unknown'
  let connectivityError: string | undefined
  if (nextAuthUrlPresent) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)
      await fetch(process.env.NEXTAUTH_URL as string, { method: 'HEAD', signal: controller.signal })
      clearTimeout(timeoutId)
      connectivity = 'ok'
    } catch (err: unknown) {
      connectivity = 'error'
      connectivityError = err instanceof Error ? err.message : 'fetch_failed'
    }
  }

  return NextResponse.json({
    ok: nextAuthSecretPresent && nextAuthUrlPresent && databaseUrlPresent,
    env: {
      NEXTAUTH_SECRET: nextAuthSecretPresent,
      NEXTAUTH_URL: nextAuthUrlPresent,
      DATABASE_URL: databaseUrlPresent
    },
    connectivity,
    connectivityError,
    timestamp: new Date().toISOString(),
    note: 'Presence booleans only; no secrets exposed.'
  })
}
