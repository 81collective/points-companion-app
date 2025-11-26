import { NextResponse } from 'next/server'
import { z } from 'zod'
import { randomBytes } from 'crypto'
import prisma from '@/lib/prisma'
import logger from '@/lib/logger'
import { sendPasswordResetEmail } from '@/lib/email'

const log = logger.child({ component: 'auth-forgot-password-api' })

const ForgotPasswordSchema = z.object({
  email: z.string().email().max(254)
})

export async function POST(request: Request) {
  try {
    const payload = await request.json()

    const parseResult = ForgotPasswordSchema.safeParse(payload)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    const { email } = parseResult.data
    const normalizedEmail = email.toLowerCase()

    // Always return success to prevent email enumeration
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    
    if (user) {
      // Generate secure token
      const token = randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Store token in database
      await prisma.passwordResetToken.upsert({
        where: { userId: user.id },
        update: { token, expiresAt },
        create: { userId: user.id, token, expiresAt }
      })

      // Send email
      await sendPasswordResetEmail(normalizedEmail, token)
      
      log.info('Password reset email sent', { action: 'forgot_password' })
    } else {
      log.info('Password reset requested for non-existent email', { action: 'forgot_password_not_found' })
    }

    // Always return success to prevent email enumeration attacks
    return NextResponse.json({ success: true })
  } catch (error) {
    log.error('Forgot password failed', { 
      action: 'forgot_password_error', 
      error: error instanceof Error ? error.message : 'Unknown' 
    })
    return NextResponse.json({ error: 'Unable to process request' }, { status: 500 })
  }
}
