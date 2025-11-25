import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireServerSession } from '@/lib/auth/session';
import { logger } from '@/lib/logger';

export async function GET() {
  const session = await requireServerSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id }
  })

  return NextResponse.json({ profile })
}

export async function PATCH(request: Request) {
  const session = await requireServerSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const updates = await request.json()

  try {
    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        firstName: updates.firstName ?? undefined,
        lastName: updates.lastName ?? undefined,
        avatarUrl: updates.avatarUrl ?? undefined,
        dashboardPreferences: updates.dashboardPreferences ?? undefined
      },
      create: {
        userId: session.user.id,
        email: session.user.email ?? '',
        firstName: updates.firstName ?? null,
        lastName: updates.lastName ?? null,
        avatarUrl: updates.avatarUrl ?? null,
        dashboardPreferences: updates.dashboardPreferences ?? {}
      }
    })

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName: updates.firstName ?? undefined,
        lastName: updates.lastName ?? undefined,
        avatarUrl: updates.avatarUrl ?? undefined
      }
    })

    return NextResponse.json({ profile })
  } catch (error) {
    logger.error('Failed to update profile', { error, route: '/api/profile' });
    return NextResponse.json({ error: 'Unable to update profile' }, { status: 500 })
  }
}
