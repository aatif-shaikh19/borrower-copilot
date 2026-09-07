/**
 * verdict.ts
 * 
 * Determines the primary decision verdict: Borrow / Don't borrow / Borrow less.
 * Checks ranked conditions in priority order:
 * 1. Hard reject signals (bounces, high-cost debt >25%, current safe-FOIR breach) -> 'dont_borrow'
 * 2. Over-stretching ask (requested amount > safe carry, but positive headroom exists) -> 'borrow_less'
 * 3. Sustainable loan (requested amount fits safe carry and buffer preserved) -> 'borrow'
 * 
 * Every output includes a one-sentence reason referencing specific answers.
 * Zero UI/React imports.
 */

import { BorrowerAnswers, VerdictCall } from '../types/borrower.ts';
import { RULES_CONFIG } from './rulesConfig.ts';
import { FoirResult } from './foir.ts';
import { calculateEmi } from './apr.ts';
import { RoutingResult } from './routing.ts';

export interface VerdictResult {
  call: VerdictCall;
  reason: string;
  detailedWhy: string;
  safeRecommendedAmount: number;
}

export function evaluateVerdict(
  answers: BorrowerAnswers,
  foir: FoirResult,
  routing: RoutingResult
): VerdictResult {
  const {
    amountWanted,
    hasRecentBounces,
    bouncesCount = 0,
    hasExistingHighCostDebt,
    highCostDebtRate = 0,
    highCostDebtAmount = 0,
    monthlyIncome,
    coApplicantIncome = 0,
    existingEmis,
  } = answers;

  const totalHouseholdIncome = monthlyIncome + coApplicantIncome;
  const proposedEmi = calculateEmi(
    amountWanted,
    routing.nominalPoint,
    routing.recommendedTenure
  );

  // --------------------------------------------------------------------------
  // Condition 1: High Priority "Don't borrow" Checks
  // --------------------------------------------------------------------------

  // A. Recent Delinquency / Bounce
  if (hasRecentBounces || bouncesCount > 0) {
    return {
      call: 'dont_borrow',
      reason: `You had an EMI bounce in the last ${RULES_CONFIG.VERDICT.DELINQUENCY_WINDOW_MONTHS} months, signaling acute cash flow stress that taking a new ₹${(amountWanted / 100000).toFixed(1)}L loan will worsen.`,
      detailedWhy: `Lenders will either reject your application outright or exploit the bounce to push you into predatory rates (>26–36%). Adding a new monthly EMI of ₹${proposedEmi.toLocaleString('en-IN')} risks triggering further defaults and severe credit damage. Focus on maintaining a 6-month clean payment track first.`,
      safeRecommendedAmount: 0,
    };
  }

  // B. Existing High-Cost Debt (>25%)
  if (
    hasExistingHighCostDebt ||
    highCostDebtRate >= RULES_CONFIG.VERDICT.HIGH_COST_DEBT_THRESHOLD
  ) {
    return {
      call: 'dont_borrow',
      reason: `You have existing debt at ${highCostDebtRate}% interest (₹${highCostDebtAmount.toLocaleString('en-IN')}); taking fresh borrowing before clearing high-cost debt compounds interest traps.`,
      detailedWhy: `Taking on new debt while carrying active app or informal loans charging ${highCostDebtRate}% is financial self-harm. Every spare rupee should go toward settling or consolidating the ₹${highCostDebtAmount.toLocaleString('en-IN')} balance before taking on any new commitments.`,
      safeRecommendedAmount: 0,
    };
  }

  // C. Existing Obligations Alone Breach Safe FOIR Ceiling
  if (foir.currentFoir >= foir.borrowerSafeFoirCeiling) {
    const currentFoirPct = Math.round(foir.currentFoir * 100);
    const safeFoirPct = Math.round(foir.borrowerSafeFoirCeiling * 100);
    return {
      call: 'dont_borrow',
      reason: `Your existing EMIs of ₹${existingEmis.toLocaleString('en-IN')} already consume ${currentFoirPct}% of your income, exceeding your safe ceiling of ${safeFoirPct}%.`,
      detailedWhy: `Even before adding a rupee of new borrowing, your monthly commitments exceed safe debt boundaries. Adding an extra EMI of ₹${proposedEmi.toLocaleString('en-IN')} leaves you vulnerable to the first unexpected emergency.`,
      safeRecommendedAmount: 0,
    };
  }

  // D. Living Buffer Breached Even Before New Loan
  if (foir.currentResidualIncome < foir.minResidualBuffer) {
    return {
      call: 'dont_borrow',
      reason: `Your current monthly income after living expenses leaves only ₹${Math.max(0, foir.currentResidualIncome).toLocaleString('en-IN')}, which is below your minimum ₹${foir.minResidualBuffer.toLocaleString('en-IN')} safety cushion.`,
      detailedWhy: `Fixed living costs and current obligations leave zero buffer for emergencies. You should avoid any incremental monthly EMI commitments right now.`,
      safeRecommendedAmount: 0,
    };
  }

  // --------------------------------------------------------------------------
  // Condition 2: "Borrow less" Checks
  // --------------------------------------------------------------------------
  if (amountWanted > foir.borrowerSafeMaxAmount) {
    const safeAmtLakhs = (foir.borrowerSafeMaxAmount / 100000).toFixed(1);
    const wantedLakhs = (amountWanted / 100000).toFixed(1);
    const safeEmi = calculateEmi(
      foir.borrowerSafeMaxAmount,
      routing.nominalPoint,
      routing.recommendedTenure
    );

    return {
      call: 'borrow_less',
      reason: `Your requested ₹${wantedLakhs}L requires an EMI of ₹${proposedEmi.toLocaleString('en-IN')}, pushing your debt ratio beyond your safe limit; reduce your ask to ₹${safeAmtLakhs}L (₹${safeEmi.toLocaleString('en-IN')}/mo).`,
      detailedWhy: `At ₹${wantedLakhs}L, your projected debt service pushes past your safe FOIR (${Math.round(foir.borrowerSafeFoirCeiling * 100)}%), eroding your emergency living buffer. A smaller loan of ₹${safeAmtLakhs}L fits safely within your monthly surplus while keeping your household resilient.`,
      safeRecommendedAmount: foir.borrowerSafeMaxAmount,
    };
  }

  // --------------------------------------------------------------------------
  // Condition 3: "Borrow" (Sustainable within safe boundaries)
  // --------------------------------------------------------------------------
  const projectedFoirPct = Math.round(
    ((existingEmis + proposedEmi) / totalHouseholdIncome) * 100
  );
  return {
    call: 'borrow',
    reason: `Your requested ₹${(amountWanted / 100000).toFixed(1)}L fits comfortably: the ₹${proposedEmi.toLocaleString('en-IN')} EMI keeps your debt ratio at a safe ${projectedFoirPct}%, leaving ₹${foir.residualIncomeAfterProposedEmi.toLocaleString('en-IN')} monthly cushion.`,
    detailedWhy: `Your existing obligations of ₹${existingEmis.toLocaleString('en-IN')} plus the proposed loan's EMI leave a healthy monthly cash reserve of ₹${foir.residualIncomeAfterProposedEmi.toLocaleString('en-IN')} (well above your ₹${foir.minResidualBuffer.toLocaleString('en-IN')} buffer), comfortably inside the ${Math.round(foir.borrowerSafeFoirCeiling * 100)}% safe debt ceiling.`,
    safeRecommendedAmount: amountWanted,
  };
}
