import { prisma } from "@/lib/db/client";
import { Errors } from "@/lib/api/errors";

export async function ensureWalletLinkedToUser(
  userId: string,
  walletAddress: string
): Promise<void> {
  const [user, linkedWallet] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { walletAddress: true },
    }),
    prisma.userWallet.findFirst({
      where: {
        userId,
        address: walletAddress,
      },
      select: { id: true },
    }),
  ]);

  const hasWalletLink =
    user?.walletAddress === walletAddress || Boolean(linkedWallet);
  if (hasWalletLink) {
    return;
  }

  const [primaryOwner, walletOwnerLink] = await Promise.all([
    prisma.user.findFirst({
      where: {
        walletAddress,
        NOT: { id: userId },
      },
      select: { id: true },
    }),
    prisma.userWallet.findUnique({
      where: { address: walletAddress },
      select: { userId: true },
    }),
  ]);

  if (primaryOwner || (walletOwnerLink && walletOwnerLink.userId !== userId)) {
    throw Errors.forbidden(
      "Enrollment wallet is already linked to another user"
    );
  }

  await prisma.user.update({
    where: { id: userId },
    data: { walletAddress },
  });

  await prisma.userWallet.updateMany({
    where: { userId },
    data: { isPrimary: false },
  });

  await prisma.userWallet.upsert({
    where: { address: walletAddress },
    create: {
      userId,
      address: walletAddress,
      isPrimary: true,
    },
    update: {
      userId,
      isPrimary: true,
    },
  });
}
