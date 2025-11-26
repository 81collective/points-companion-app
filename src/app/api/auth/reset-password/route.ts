import { NextResponse } from 'next/server'
import { z } from 'zod'
import { hash } from 'bcryptjs'
import prisma from '@/lib/prisma'
import logger from '@/lib/logger'

const log = logger.child({ component: 'auth-reset-password-api' })

const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128)
})

export async function POST(request: Request) {
  try {
    const payload = await request.json()

    const parseResult = ResetPasswordSchema.safeParse(payload)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    const { token, password } = parseResult.data

    // Find valid token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link. Please request a new one.' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await hash(password, 12)

    // Update user password and delete token
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { hashedPassword }
      }),
      prisma.passwordResetToken.delete({
        where: { id: resetToken.id }
      })
    ])

    log.info('Password reset successful', { action: 'reset_password' })
    return NextResponse.json({ success: true })
  } catch (error) {
    log.error('Reset password failed', { 
      action: 'reset_password_error', 
      error: error instanceof Error ? error.message : 'Unknown' 
    })
    return NextResponse.json({ error: 'Unable to reset password' }, { status: 500 })
  }
}
