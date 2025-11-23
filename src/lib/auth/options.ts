import type { User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { AuthOptions } from 'next-auth/core/types';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import prisma from '@/lib/prisma';

export const authOptions: AuthOptions = {
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
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.sub = user.id
        token.firstName = (user as User & { firstName?: string | null }).firstName ?? null
        token.lastName = (user as User & { lastName?: string | null }).lastName ?? null
        token.avatarUrl = (user as User & { avatarUrl?: string | null }).avatarUrl ?? null
      }
      return token
    },
    async session({ session, token }: { session: { user?: { id?: string; email?: string | null; name?: string | null; image?: string | null }; expires: string }; token: JWT }) {
      if (session.user && token) {
        (session.user as { id?: string }).id = token.sub as string;
        (session.user as { firstName?: string }).firstName = (token.firstName as string | null) ?? undefined;
        (session.user as { lastName?: string }).lastName = (token.lastName as string | null) ?? undefined;
        (session.user as { avatarUrl?: string }).avatarUrl = (token.avatarUrl as string | null) ?? undefined
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET
}

export default authOptions
