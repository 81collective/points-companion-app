import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { requireServerSession } from '@/lib/auth/session'
import logger from '@/lib/logger'

const log = logger.child({ component: 'totp-api' })

// Validation schema
const EnableTOTPSchema = z.object({
  secret: z.string().min(16).max(64),
})

export async function GET() {
  const session = await requireServerSession()
  const secret = await prisma.totpSecret.findUnique({ where: { userId: session.user!.id } })
  return NextResponse.json({ enabled: secret?.enabled ?? false, secret: secret?.secret ?? null })
}

export async function POST(request: Request) {
  const session = await requireServerSession()

  try {
    const payload = await request.json()
    
    const parseResult = EnableTOTPSchema.safeParse(payload)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid secret', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const record = await prisma.totpSecret.upsert({
      where: { userId: session.user!.id },
      create: { userId: session.user!.id, secret: parseResult.data.secret, enabled: true },
      update: { secret: parseResult.data.secret, enabled: true }
    })

    log.info('TOTP enabled', { action: 'enable' })
    return NextResponse.json({ enabled: record.enabled })
  } catch (error) {
    log.error('Failed to enable TOTP', { action: 'enable_error', error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({ error: 'Unable to enable TOTP' }, { status: 500 })
  }
}

export async function DELETE() {
  const session = await requireServerSession()

  try {
    await prisma.totpSecret.upsert({
      where: { userId: session.user!.id },
      create: { userId: session.user!.id, secret: '', enabled: false },
      update: { enabled: false }
    })
    log.info('TOTP disabled', { action: 'disable' })
    return NextResponse.json({ enabled: false })
  } catch (error) {
    log.error('Failed to disable TOTP', { action: 'disable_error', error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({ error: 'Unable to disable TOTP' }, { status: 500 })
  }
}
