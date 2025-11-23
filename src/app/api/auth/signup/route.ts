import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const normalizedEmail = String(email).toLowerCase()

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email is already registered' }, { status: 400 })
    }

    const hashedPassword = await hash(String(password), 12)

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        hashedPassword,
        firstName: firstName ? String(firstName) : null,
        lastName: lastName ? String(lastName) : null,
        profile: {
          create: {
            email: normalizedEmail,
            firstName: firstName ? String(firstName) : null,
            lastName: lastName ? String(lastName) : null
          }
        }
      },
      select: { id: true }
    })

    return NextResponse.json({ success: true, userId: user.id })
  } catch (error) {
    console.error('[auth/signup] Failed to create account', error)
    return NextResponse.json({ error: 'Unable to create account' }, { status: 500 })
  }
}
