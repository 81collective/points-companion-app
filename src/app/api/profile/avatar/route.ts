import { NextResponse } from 'next/server';
import { Buffer } from 'node:buffer';
import prisma from '@/lib/prisma';
import { requireServerSession } from '@/lib/auth/session';
import { logger } from '@/lib/logger';

const MAX_AVATAR_SIZE = 2 * 1024 * 1024 // 2MB

function buildError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(request: Request) {
  const session = await requireServerSession();
  if (!session?.user?.id) {
    return buildError('Unauthorized', 401)
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return buildError('No file provided')
    }

    if (!file.type?.startsWith('image/')) {
      return buildError('Only image uploads are supported')
    }

    if (file.size > MAX_AVATAR_SIZE) {
      return buildError('Avatar exceeds 2MB limit')
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const mime = file.type || 'image/png'
    const base64 = `data:${mime};base64,${buffer.toString('base64')}`

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: { avatarUrl: base64 },
      create: {
        userId: session.user.id,
        email: session.user.email ?? '',
        avatarUrl: base64,
        dashboardPreferences: {}
      }
    })

    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarUrl: base64 }
    })

    return NextResponse.json({ avatarUrl: profile.avatarUrl })
  } catch (error) {
    logger.error('Avatar upload failed', { error, route: '/api/profile/avatar' });
    return buildError('Unable to upload avatar', 500)
  }
}
