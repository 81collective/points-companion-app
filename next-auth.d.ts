import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT as DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user?: DefaultSession['user'] & {
      id: string
      firstName?: string | null
      lastName?: string | null
      avatarUrl?: string | null
    }
  }

  interface User extends DefaultUser {
    firstName?: string | null
    lastName?: string | null
    avatarUrl?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    firstName?: string | null
    lastName?: string | null
    avatarUrl?: string | null
  }
}
