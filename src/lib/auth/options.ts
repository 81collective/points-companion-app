import type { User, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

type ExtendedUser = User & {
  id?: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
};

type ExtendedJWT = JWT & {
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
};
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import prisma from '@/lib/prisma';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth'
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error('Missing email or password')
        }

        const normalizedEmail = credentials.email.toLowerCase()
        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
        if (!user || !user.hashedPassword) {
          throw new Error('Invalid email or password')
        }

        const isValid = await compare(credentials.password, user.hashedPassword)
        if (!isValid) {
          throw new Error('Invalid email or password')
        }

        return {
          id: user.id,
          email: user.email,
          name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatarUrl: user.avatarUrl
        }
      }
    })
  ],
  callbacks: {
     
    jwt: async ({ token, user }: { token: JWT; user?: User }) => {
      if (user) {
        const u = user as ExtendedUser;
        const tk = token as ExtendedJWT;
        tk.sub = u.id;
        tk.firstName = u.firstName ?? null;
        tk.lastName = u.lastName ?? null;
        tk.avatarUrl = u.avatarUrl ?? null;
      }
      return token as JWT
    },
    session: async ({ session, token }: { session: Session; token: JWT }) => {
      if (session.user && token.sub) {
        session.user.id = token.sub as string
        session.user.firstName = token.firstName ?? undefined
        session.user.lastName = token.lastName ?? undefined
        session.user.avatarUrl = token.avatarUrl ?? undefined
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET
}

export default authOptions
