import type { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import prisma from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
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
    jwt: async ({ token, user }) => {
      if (user) {
        token.sub = user.id
        token.firstName = user.firstName ?? null
        token.lastName = user.lastName ?? null
        token.avatarUrl = user.avatarUrl ?? null
      }
      return token
    },
    session: async ({ session, token }) => {
      if (session.user && token.sub) {
        session.user.id = token.sub
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
