import type { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import prisma from '@/lib/prisma'

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
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token.firstName = (user as { firstName?: string | null }).firstName ?? null
        token.lastName = (user as { lastName?: string | null }).lastName ?? null
        token.avatarUrl = (user as { avatarUrl?: string | null }).avatarUrl ?? null
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.sub as string
        session.user.firstName = (token.firstName as string | null) ?? undefined
        session.user.lastName = (token.lastName as string | null) ?? undefined
        session.user.avatarUrl = (token.avatarUrl as string | null) ?? undefined
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET
}

export default authOptions
