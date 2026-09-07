/**
 * foir.ts
 * 
 * Affordability and FOIR (Fixed Obligation to Income Ratio) calculations.
 * Computes both Lender Likely Sanction and Borrower Safe Carry amounts.
 * Zero UI/React imports.
 */

import { BorrowerAnswers } from '../types/borrower.ts';
import { RULES_CONFIG } from './rulesConfig.ts';
import { calculatePrincipalFromEmi } from './apr.ts';
import { RoutingResult } from './routing.ts';

export interface FoirResult {
  lenderFoirCeiling: number;
  borrowerSafeFoirCeiling: number;
  currentFoir: number;
  projectedLenderEmiHeadroom: number;
  projectedSafeEmiCeiling: number;
  lenderLikelyMaxAmount: number;
  borrowerSafeMaxAmount: number;
  minResidualBuffer: number;
  currentResidualIncome: number;
  residualIncomeAfterProposedEmi: number;
  recommendedUse: 'borrowerSafe' | 'lenderLikely';
  whyDifference: string;
}

export function calculateFoirAndAffordability(
  answers: BorrowerAnswers,
  routing: RoutingResult
): FoirResult {
  const {
    monthlyIncome,
    coApplicantIncome = 0,
    existingEmis,
    householdExpenses,
    rentExpense = 0,
    employmentType,
    variableIncomePercent = 0,
    productiveLoan = false,
    expectedMonthlyRevenueBoost = 0,
    collateralValue = 0,
    amountWanted,
  } = answers;

  // Total household effective monthly income (co-applicant counted partially if informal, fully if salaried)
  const effectiveMonthlyIncome = monthlyIncome + coApplicantIncome;

  // 1. Determine Lender FOIR Ceiling
  let lenderFoirCeiling: number = RULES_CONFIG.FOIR.LENDER_CEILING_SALARIED;
  if (routing.securityType === 'secured') {
    lenderFoirCeiling = RULES_CONFIG.FOIR.LENDER_CEILING_SECURED; // 65%
  } else if (employmentType === 'self_employed') {
    lenderFoirCeiling = RULES_CONFIG.FOIR.LENDER_CEILING_SELF_EMPLOYED; // 45%
  } else if (
    employmentType === 'salaried' &&
    monthlyIncome >= RULES_CONFIG.FOIR.SALARIED_HIGH_INCOME_THRESHOLD
  ) {
    lenderFoirCeiling = RULES_CONFIG.FOIR.LENDER_CEILING_SALARIED_HIGH_INCOME; // 60%
  }

  // 2. Determine Borrower Safe FOIR Ceiling
  let borrowerSafeFoirCeiling: number = RULES_CONFIG.FOIR.BORROWER_SAFE_DEFAULT; // 35%
  const isInformalOrVariable =
    employmentType === 'informal' || variableIncomePercent > 30;

  if (isInformalOrVariable) {
    borrowerSafeFoirCeiling = RULES_CONFIG.FOIR.BORROWER_SAFE_INFORMAL; // 25%
  }

  // Safe FOIR boost if productive loan with stated positive expected return (+5pp)
  if (productiveLoan && expectedMonthlyRevenueBoost > 0) {
    borrowerSafeFoirCeiling += RULES_CONFIG.FOIR.PRODUCTIVE_PURPOSE_BOOST;
  }

  // 3. Current FOIR
  const currentFoir =
    effectiveMonthlyIncome > 0 ? existingEmis / effectiveMonthlyIncome : 1.0;

  // 4. Lender EMI headroom & max principal
  const lenderEmiHeadroom = Math.max(
    0,
    Math.round(effectiveMonthlyIncome * lenderFoirCeiling - existingEmis)
  );

  let lenderMaxPrincipal = calculatePrincipalFromEmi(
    lenderEmiHeadroom,
    routing.nominalPoint,
    routing.recommendedTenure
  );

  // Apply LTV Cap to Lender Max if secured
  if (routing.securityType === 'secured' && collateralValue > 0) {
    if (routing.productCode === 'lap') {
      const lapLtvCap = Math.round(
        collateralValue * RULES_CONFIG.LTV.LAP_ASSUMED_VALUATION_FACTOR
      );
      lenderMaxPrincipal = Math.min(lenderMaxPrincipal, lapLtvCap);
    } else if (routing.productCode === 'gold_loan') {
      let ltvRate = RULES_CONFIG.LTV.GOLD_ABOVE_5L;
      if (amountWanted < 250000) ltvRate = RULES_CONFIG.LTV.GOLD_UNDER_2_5L;
      else if (amountWanted <= 500000) ltvRate = RULES_CONFIG.LTV.GOLD_2_5L_TO_5L;
      const goldLtvCap = Math.round(collateralValue * ltvRate);
      lenderMaxPrincipal = Math.min(lenderMaxPrincipal, goldLtvCap);
    }
  }

  // 5. Borrower Safe EMI Ceiling & Buffer Protection
  const minResidualBuffer = Math.max(
    RULES_CONFIG.FOIR.MIN_RESIDUAL_BUFFER_ABSOLUTE,
    Math.round(effectiveMonthlyIncome * RULES_CONFIG.FOIR.MIN_RESIDUAL_BUFFER_RATIO)
  );

  const totalCurrentLivingCosts = existingEmis + householdExpenses + rentExpense;
  const currentResidualIncome = effectiveMonthlyIncome - totalCurrentLivingCosts;

  // Max EMI allowable while preserving the minimum living/emergency buffer
  const maxEmiByBuffer = Math.max(0, currentResidualIncome - minResidualBuffer);
  const maxEmiByFoir = Math.max(
    0,
    Math.round(effectiveMonthlyIncome * borrowerSafeFoirCeiling - existingEmis)
  );

  // The true safe ceiling is constrained by both the safe FOIR and the cash buffer
  const safeEmiCeiling = Math.min(maxEmiByFoir, maxEmiByBuffer);

  let borrowerSafeMaxPrincipal = calculatePrincipalFromEmi(
    safeEmiCeiling,
    routing.nominalPoint,
    routing.recommendedTenure
  );

  // Also apply LTV cap if secured
  if (routing.securityType === 'secured' && collateralValue > 0) {
    if (routing.productCode === 'lap') {
      const lapLtvCap = Math.round(
        collateralValue * RULES_CONFIG.LTV.LAP_ASSUMED_VALUATION_FACTOR
      );
      borrowerSafeMaxPrincipal = Math.min(borrowerSafeMaxPrincipal, lapLtvCap);
    }
  }

  // Round amounts to nearest thousand for clarity
  const roundedLenderMax = Math.round(lenderMaxPrincipal / 1000) * 1000;
  const roundedBorrowerSafeMax = Math.round(borrowerSafeMaxPrincipal / 1000) * 1000;

  // Residual after safe EMI
  const residualIncomeAfterProposedEmi = currentResidualIncome - safeEmiCeiling;

  const whyDiff =
    roundedLenderMax > roundedBorrowerSafeMax
      ? `A bank model will push you up to ${(lenderFoirCeiling * 100).toFixed(0)}% of income (sanctioning up to ₹${(roundedLenderMax / 100000).toFixed(1)}L), but borrowing beyond ${(borrowerSafeFoirCeiling * 100).toFixed(0)}% (₹${(roundedBorrowerSafeMax / 100000).toFixed(1)}L) leaves zero margin for emergencies, inflation, or surprise medical expenses.`
      : `Both limits align closely because existing obligations and expenses consume available cash flow headroom.`;

  return {
    lenderFoirCeiling,
    borrowerSafeFoirCeiling,
    currentFoir,
    projectedLenderEmiHeadroom: lenderEmiHeadroom,
    projectedSafeEmiCeiling: safeEmiCeiling,
    lenderLikelyMaxAmount: roundedLenderMax,
    borrowerSafeMaxAmount: roundedBorrowerSafeMax,
    minResidualBuffer,
    currentResidualIncome,
    residualIncomeAfterProposedEmi,
    recommendedUse: 'borrowerSafe',
    whyDifference: whyDiff,
  };
}
