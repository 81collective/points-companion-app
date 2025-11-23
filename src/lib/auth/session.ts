import type { Session } from 'next-auth'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/options'

export async function requireServerSession(): Promise<Session> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await getServerSession(authOptions as any) as Session | null;
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function getOptionalServerSession(): Promise<Session | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return getServerSession(authOptions as any) as Session | null;
}
