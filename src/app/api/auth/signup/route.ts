import { NextResponse } from 'next/server'
import { z } from 'zod'
import { hash } from 'bcryptjs'
import prisma from '@/lib/prisma'
import logger from '@/lib/logger'

const log = logger.child({ component: 'auth-signup-api' })

// Validation schema
const SignupSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
})

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    
    const parseResult = SignupSchema.safeParse(payload)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { email, password, firstName, lastName } = parseResult.data
    const normalizedEmail = email.toLowerCase()

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email is already registered' }, { status: 400 })
    }

    const hashedPassword = await hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        profile: {
          create: {
            email: normalizedEmail,
            firstName: firstName || null,
            lastName: lastName || null
          }
        }
      },
      select: { id: true }
    })

    log.info('User created', { action: 'signup' })
    return NextResponse.json({ success: true, userId: user.id })
  } catch (error) {
    log.error('Signup failed', { action: 'signup_error', error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({ error: 'Unable to create account' }, { status: 500 })
  }
}
