import type { Session } from 'next-auth'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/options'

export async function requireServerSession(): Promise<Session> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function getOptionalServerSession(): Promise<Session | null> {
  return getServerSession(authOptions);
}
