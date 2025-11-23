'use client'

import { SessionProvider } from 'next-auth/react'

interface Props {
  children: React.ReactNode
}

export function SessionProviderWrapper({ children }: Props) {
  return <SessionProvider>{children}</SessionProvider>
}

export default SessionProviderWrapper
