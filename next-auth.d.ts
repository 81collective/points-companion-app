import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
      firstName?: string | null
      lastName?: string | null
      avatarUrl?: string | null
    }
  }

  interface User {
    id: string
    email?: string | null
    name?: string | null
    image?: string | null
    firstName?: string | null
    lastName?: string | null
    avatarUrl?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sub?: string
    firstName?: string | null
    lastName?: string | null
    avatarUrl?: string | null
  }
}
