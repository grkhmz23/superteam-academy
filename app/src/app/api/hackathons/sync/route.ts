import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { hackathonService } from '@/lib/services/implementations';
import { prisma } from '@/lib/db/client';
import { Errors, handleApiError } from '@/lib/api/errors';

export const dynamic = 'force-dynamic';

/**
 * POST /api/hackathons/sync
 * Sync hackathons from Devfolio (admin only)
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw Errors.unauthorized('Unauthorized');
    }

    // Check if user is admin
    const isAdmin = await checkIsAdmin(session.user.id);
    if (!isAdmin) {
      throw Errors.forbidden('Only admins can sync hackathons');
    }

    const syncedCount = await hackathonService.syncFromDevfolio();

    return NextResponse.json({
      success: true,
      syncedCount,
      message: `Successfully synced ${syncedCount} hackathon events from Devfolio`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

async function checkIsAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  const adminEmails = process.env.ADMIN_EMAILS?.split(',') ?? [];
  return adminEmails.includes(user?.email ?? '');
}
