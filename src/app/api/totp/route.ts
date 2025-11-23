import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireServerSession } from '@/lib/auth/session'

export async function GET() {
  const session = await requireServerSession()
  const secret = await prisma.totpSecret.findUnique({ where: { userId: session.user!.id } })
  return NextResponse.json({ enabled: secret?.enabled ?? false, secret: secret?.secret ?? null })
}

export async function POST(request: Request) {
  const session = await requireServerSession()

  try {
    const { secret } = await request.json()
    if (!secret) {
      return NextResponse.json({ error: 'Secret is required' }, { status: 400 })
    }

    const record = await prisma.totpSecret.upsert({
      where: { userId: session.user!.id },
      create: { userId: session.user!.id, secret, enabled: true },
      update: { secret, enabled: true }
    })

    return NextResponse.json({ enabled: record.enabled })
  } catch (error) {
    console.error('[totp] failed to enable totp', error)
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
    return NextResponse.json({ enabled: false })
  } catch (error) {
    console.error('[totp] failed to disable totp', error)
    return NextResponse.json({ error: 'Unable to disable TOTP' }, { status: 500 })
  }
}
