import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import {
  buildCertificateFromRecord,
  buildVerificationUrl,
  findMatchingCredential,
  generateCertificatePublicId,
} from "@/lib/certificates/records";
import { prisma } from "@/lib/db/client";
import { getContentService } from "@/lib/services/content-factory";
import { getCredentials } from "@/lib/services/onchain";
import { Errors, handleApiError } from "@/lib/api/errors";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: Request,
  { params }: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const certificateId = id?.trim();
    if (!certificateId) {
      throw Errors.badRequest("Invalid certificate id");
    }

    const publicCertificate = await prisma.certificateRecord.findUnique({
      where: { publicId: certificateId },
    });

    if (publicCertificate) {
      return NextResponse.json({
        certificate: buildCertificateFromRecord(publicCertificate),
        verification: {
          valid: Boolean(publicCertificate.credentialMintSnapshot),
          owner: publicCertificate.recipientWalletSnapshot ?? null,
        },
      });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw Errors.notFound("Certificate not found");
    }

    const courseSlug = certificateId;
    const [user, enrollment, course] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          username: true,
          displayName: true,
          walletAddress: true,
        },
      }),
      prisma.enrollment.findUnique({
        where: {
          userId_courseSlug: {
            userId: session.user.id,
            courseSlug,
          },
        },
        select: {
          courseSlug: true,
          completedAt: true,
        },
      }),
      getContentService().getCourse(courseSlug),
    ]);

    if (!user) {
      throw Errors.notFound("User not found");
    }

    if (!enrollment?.completedAt || !course) {
      throw Errors.notFound("Certificate not found");
    }

    const credentials = user.walletAddress
      ? await getCredentials(user.walletAddress)
      : [];
    const matchingCredential = findMatchingCredential(course.slug, credentials);
    const credentialMint = matchingCredential?.mintAddress ?? null;
    const verificationUrl = buildVerificationUrl(credentialMint);

    const issuedCertificate = await prisma.certificateRecord.upsert({
      where: {
        userId_courseSlug: {
          userId: session.user.id,
          courseSlug: course.slug,
        },
      },
      update: {},
      create: {
        publicId: generateCertificatePublicId(),
        userId: session.user.id,
        courseSlug: course.slug,
        courseNameSnapshot: course.title,
        completedAt: enrollment.completedAt,
        xpEarned: course.totalXP ?? 0,
        recipientNameSnapshot:
          user.displayName ?? user.username ?? "Superteam Academy Learner",
        recipientWalletSnapshot: user.walletAddress ?? null,
        credentialMintSnapshot: credentialMint,
        verificationUrlSnapshot: verificationUrl || null,
      },
    });

    return NextResponse.json({
      certificate: buildCertificateFromRecord(issuedCertificate),
      verification: {
        valid: Boolean(
          issuedCertificate.credentialMintSnapshot ?? credentialMint
        ),
        owner:
          issuedCertificate.recipientWalletSnapshot ?? user.walletAddress ?? null,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
