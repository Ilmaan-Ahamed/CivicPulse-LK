import { db } from "@/lib/db";
import { VerificationStatus } from "@prisma/client";

/**
 * Trust Score Calculation Algorithm
 * 
 * Base score: 50
 * - Confirmed verification: +2
 * - Disputed verification: -5
 * - Report eventually resolved: +3
 * - Report eventually rejected: -2
 * 
 * Range: 0-100
 */

export async function updateTrustScoreAfterVerification(
  userId: string,
  status: VerificationStatus
): Promise<number> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { trustScore: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  let newScore = user.trustScore;

  if (status === VerificationStatus.CONFIRMED) {
    newScore = Math.min(100, newScore + 2);
  } else if (status === VerificationStatus.DISPUTED) {
    newScore = Math.max(0, newScore - 5);
  }

  await db.user.update({
    where: { id: userId },
    data: { trustScore: newScore },
  });

  return newScore;
}

export async function updateTrustScoreAfterReportResolution(
  userId: string,
  reportResolved: boolean
): Promise<number> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { trustScore: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  let newScore = user.trustScore;

  if (reportResolved) {
    newScore = Math.min(100, newScore + 3);
  } else {
    newScore = Math.max(0, newScore - 2);
  }

  await db.user.update({
    where: { id: userId },
    data: { trustScore: newScore },
  });

  return newScore;
}
