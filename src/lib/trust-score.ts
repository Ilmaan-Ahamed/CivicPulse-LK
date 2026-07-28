/**
 * Trust Score Calculation System
 *
 * Trust scores determine a verifier's reliability. Higher trust scores
 * mean their verifications carry more weight toward the confirmation threshold.
 *
 * Score range: 0–100
 * Initial score: 50
 *
 * Scoring factors:
 * - Accurate verifications (confirmed by majority) → +5
 * - Inaccurate verifications (contradicted by majority) → -10
 * - Consistent streak bonus → +2 per consecutive accurate verification
 * - Community flagging penalty → -15
 * - Inactivity decay → -1 per month of inactivity (min 10)
 */

export interface TrustScoreUpdate {
  currentScore: number;
  verificationAccurate: boolean;
  consecutiveAccurate: number;
  wasFlagged?: boolean;
}

/**
 * Calculate the new trust score after a verification outcome.
 */
export function calculateNewTrustScore({
  currentScore,
  verificationAccurate,
  consecutiveAccurate,
  wasFlagged = false,
}: TrustScoreUpdate): number {
  let newScore = currentScore;

  if (verificationAccurate) {
    // Base reward for accurate verification
    newScore += 5;

    // Streak bonus: +2 for each consecutive accurate verification (max +10)
    const streakBonus = Math.min(consecutiveAccurate * 2, 10);
    newScore += streakBonus;
  } else {
    // Penalty for inaccurate verification
    newScore -= 10;
  }

  // Community flagging penalty
  if (wasFlagged) {
    newScore -= 15;
  }

  // Clamp to valid range
  return Math.max(0, Math.min(100, newScore));
}

/**
 * Calculate the effective weight of a verifier's vote based on their trust score.
 * Higher trust = more influence on verification outcome.
 *
 * Trust 0-25:   weight 0.5 (low confidence)
 * Trust 25-50:  weight 0.75
 * Trust 50-75:  weight 1.0 (standard)
 * Trust 75-100: weight 1.5 (high confidence)
 */
export function getVerificationWeight(trustScore: number): number {
  if (trustScore < 25) return 0.5;
  if (trustScore < 50) return 0.75;
  if (trustScore < 75) return 1.0;
  return 1.5;
}

/**
 * Determine if a report has reached the verification threshold.
 *
 * Uses weighted voting: each verifier's confirmation/dispute
 * is multiplied by their trust-score weight.
 *
 * @param confirmations - Array of trust scores of confirming verifiers
 * @param disputes - Array of trust scores of disputing verifiers
 * @param threshold - Weighted threshold needed (default 3.0)
 * @returns Object with verification result
 */
export function checkVerificationThreshold(
  confirmations: number[],
  disputes: number[],
  threshold: number = 3.0
): {
  isVerified: boolean;
  isRejected: boolean;
  confirmWeight: number;
  disputeWeight: number;
  progress: number;
} {
  const confirmWeight = confirmations.reduce(
    (sum, score) => sum + getVerificationWeight(score),
    0
  );
  const disputeWeight = disputes.reduce(
    (sum, score) => sum + getVerificationWeight(score),
    0
  );

  const isVerified = confirmWeight >= threshold && confirmWeight > disputeWeight * 2;
  const isRejected = disputeWeight >= threshold && disputeWeight > confirmWeight * 2;
  const progress = Math.min((confirmWeight / threshold) * 100, 100);

  return {
    isVerified,
    isRejected,
    confirmWeight,
    disputeWeight,
    progress,
  };
}

/**
 * Apply monthly inactivity decay to a trust score.
 * -1 per month of inactivity, minimum score of 10.
 */
export function applyInactivityDecay(
  currentScore: number,
  monthsInactive: number
): number {
  const decayedScore = currentScore - monthsInactive;
  return Math.max(10, decayedScore);
}

/**
 * Get a human-readable trust level label.
 */
export function getTrustLevel(
  trustScore: number
): "Untrusted" | "Low" | "Standard" | "Trusted" | "Expert" {
  if (trustScore < 15) return "Untrusted";
  if (trustScore < 35) return "Low";
  if (trustScore < 60) return "Standard";
  if (trustScore < 85) return "Trusted";
  return "Expert";
}

/**
 * Trust level color mapping for UI badges.
 */
export const TRUST_LEVEL_COLORS: Record<string, string> = {
  Untrusted: "bg-red-500/20 text-red-400 border-red-500/30",
  Low: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Standard: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Trusted: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Expert: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};
