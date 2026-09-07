/**
 * index.ts
 * 
 * Master entrypoint for the rules engine.
 * Exposes a single pure function: evaluate(answers: BorrowerAnswers): FourOutputs
 * 
 * Strict constraints:
 * - Zero React/UI imports
 * - Pure determinism: same answers -> same FourOutputs
 * - Every output backed by a one-sentence plain English traceability statement
 */

import { BorrowerAnswers, FourOutputs, TenureOption } from '../types/borrower.ts';
import { RULES_CONFIG } from './rulesConfig.ts';
import { calculateAllInApr, calculateEmi } from './apr.ts';
import { determineProductRouting } from './routing.ts';
import { calculateFoirAndAffordability } from './foir.ts';
import { evaluateVerdict } from './verdict.ts';
import { evaluateConfidence } from './confidence.ts';

export * from './rulesConfig.ts';
export * from './apr.ts';
export * from './routing.ts';
export * from './foir.ts';
export * from './verdict.ts';
export * from './confidence.ts';

export function evaluate(answers: BorrowerAnswers): FourOutputs {
  // 1. Product Routing & Rate Bands
  const routing = determineProductRouting(answers);

  // 2. Affordability & Max Amounts (Lender vs Safe)
  const foir = calculateFoirAndAffordability(answers, routing);

  // 3. Verdict
  const verdict = evaluateVerdict(answers, foir, routing);

  // 4. Confidence & Band Widening
  const confidence = evaluateConfidence(answers);

  // Apply confidence widening to rate band
  // Lower bound moves lower if confidence is high, or band widens if confidence is low
  const baseBandWidth = routing.bandHigh - routing.bandLow;
  const widenedExtra = baseBandWidth * confidence.wideningMultiplier;
  const finalBandLow = Math.max(7.0, Math.round((routing.bandLow - widenedExtra * 0.4) * 10) / 10);
  const finalBandHigh = Math.round((routing.bandHigh + widenedExtra * 0.6) * 10) / 10;

  // 5. Amount to evaluate for APR and EMI
  const loanPrincipalToQuote =
    verdict.call === 'borrow_less'
      ? foir.borrowerSafeMaxAmount
      : answers.amountWanted;

  // 6. True All-in APR (Cash Flow IRR with Upfront Processing Fee)
  const aprResult = calculateAllInApr(
    loanPrincipalToQuote,
    routing.nominalPoint,
    routing.recommendedTenure,
    RULES_CONFIG.CHARGES.TOTAL_UPFRONT_FEE_RATE
  );

  // 7. Tenure Options
  const tenureOptions: TenureOption[] = routing.tenuresAvailable.map((months) => {
    const emi = calculateEmi(loanPrincipalToQuote, routing.nominalPoint, months);
    const totalRepayment = emi * months;
    const totalInterest = Math.max(0, totalRepayment - loanPrincipalToQuote);
    return {
      months,
      emi,
      totalInterest,
      totalRepayment,
    };
  });

  // 8. Stress Case Testing (RULES.md §9)
  // Informal / gig workers stress against income drop (20%); salaried / secured stress against rate hike (+2% / +200 bps)
  const isInformal = answers.employmentType === 'informal' || (answers.variableIncomePercent ?? 0) > 30;
  let stressCase: FourOutputs['emi']['stressCase'];

  if (isInformal) {
    const stressedIncome = Math.round(answers.monthlyIncome * (1 - RULES_CONFIG.STRESS.INCOME_DROP_PERCENT));
    const livingExpenses = answers.householdExpenses + (answers.rentExpense ?? 0);
    const baseEmi = aprResult.monthlyEmi;
    const stressedSurplus = stressedIncome - answers.existingEmis - livingExpenses - baseEmi;
    const isBreached = stressedSurplus < foir.minResidualBuffer;

    stressCase = {
      scenario: 'Informal Income Shock: Monthly income drops by 20%',
      stressedMetric: `Stressed income ₹${stressedIncome.toLocaleString('en-IN')}/mo (down from ₹${answers.monthlyIncome.toLocaleString('en-IN')})`,
      bufferRemaining: stressedSurplus,
      isBreached,
      verdict: isBreached
        ? `Breaches safety buffer by ₹${Math.abs(stressedSurplus).toLocaleString('en-IN')}/mo. In bad gig/seasonal months, this EMI cannot be paid without defaulting.`
        : `Surplus of ₹${stressedSurplus.toLocaleString('en-IN')}/mo remains above the minimum safety buffer even during a 20% income downturn.`,
    };
  } else {
    // Interest Rate Hike of +200 bps (+2.0%)
    const stressedRate = routing.nominalPoint + RULES_CONFIG.STRESS.RATE_HIKE_PERCENT;
    const stressedEmi = calculateEmi(loanPrincipalToQuote, stressedRate, routing.recommendedTenure);
    const emiIncrease = stressedEmi - aprResult.monthlyEmi;
    const totalHousehold = answers.monthlyIncome + (answers.coApplicantIncome ?? 0);
    const stressedResidual = totalHousehold - answers.existingEmis - answers.householdExpenses - (answers.rentExpense ?? 0) - stressedEmi;
    const isBreached = stressedResidual < foir.minResidualBuffer;

    stressCase = {
      scenario: 'Floating Rate Hike: Interest rate increases by +2.0% (+200 bps)',
      stressedMetric: `Stressed EMI ₹${stressedEmi.toLocaleString('en-IN')}/mo (+₹${emiIncrease.toLocaleString('en-IN')}/mo at ${stressedRate.toFixed(1)}%)`,
      bufferRemaining: stressedResidual,
      isBreached,
      verdict: isBreached
        ? `Rate hike reduces your emergency buffer to ₹${stressedResidual.toLocaleString('en-IN')}, below your ₹${foir.minResidualBuffer.toLocaleString('en-IN')} target.`
        : `Safe buffer of ₹${stressedResidual.toLocaleString('en-IN')}/mo remains intact even if benchmark rates surge by 2.0%.`,
    };
  }

  // 9. Traceability Statements (One sentence per output, referencing specific inputs)
  const traceability: string[] = [
    `O1 (Verdict): ${verdict.reason}`,
    `O2 (Amounts): Lender caps at ₹${(foir.lenderLikelyMaxAmount / 100000).toFixed(1)}L based on ${(foir.lenderFoirCeiling * 100).toFixed(0)}% FOIR, but your safe limit is ₹${(foir.borrowerSafeMaxAmount / 100000).toFixed(1)}L to protect your ₹${foir.minResidualBuffer.toLocaleString('en-IN')} living buffer.`,
    `O3 (Rate & APR): Recommended ${routing.productName} with fair rate band ${finalBandLow}%–${finalBandHigh}%; all-in APR is ${aprResult.apr}% including ${(RULES_CONFIG.CHARGES.TOTAL_UPFRONT_FEE_RATE * 100).toFixed(2)}% processing fees and GST.`,
    `O4 (EMI Ceiling): Safe monthly EMI ceiling is ₹${foir.projectedSafeEmiCeiling.toLocaleString('en-IN')}, leaving ${stressCase.bufferRemaining >= 0 ? '₹' + stressCase.bufferRemaining.toLocaleString('en-IN') : 'a deficit'} in the 20% income-drop stress case.`,
  ];

  // 10. Negotiation Card Generation
  let counterScript = {
    ifLenderSays: `Lender offers standard rate at ${Math.round(finalBandHigh + 2.5)}% with ₹${Math.round(loanPrincipalToQuote * 0.025).toLocaleString('en-IN')} fees.`,
    borrowerShouldReply: `Fair market rate for my profile is ${finalBandLow}%–${finalBandHigh}%. I request ${finalBandLow}% with upfront fee capped at ${(RULES_CONFIG.CHARGES.PROCESSING_FEE_RATE * 100).toFixed(1)}%.`,
  };

  const keyLevers: string[] = [];

  if (answers.creditScoreKnown && (answers.creditScore ?? 0) >= 750) {
    keyLevers.push(`CIBIL score of ${answers.creditScore} qualifies for tier-1 prime bank rates`);
  }
  if (answers.collateralValue && answers.collateralValue >= answers.amountWanted * 2) {
    keyLevers.push(`Unencumbered collateral worth ₹${(answers.collateralValue / 100000).toFixed(1)}L provides 2x+ loan coverage`);
  }
  if (answers.tenureYearsInWork && answers.tenureYearsInWork >= 3) {
    keyLevers.push(`${answers.tenureYearsInWork} years of documented stable income/business vintage`);
  }
  if (answers.coApplicantIncome && answers.coApplicantIncome > 0) {
    keyLevers.push(`Additional household co-applicant income of ₹${answers.coApplicantIncome.toLocaleString('en-IN')}/mo`);
  }

  // Persona-specific counter-scripts
  if (answers.collateralValue && answers.collateralValue >= answers.amountWanted * 2 && routing.productCode === 'lap') {
    counterScript = {
      ifLenderSays: `Lender offers unsecured loan at 16–22% citing no bureau score or informal kirana cash flow.`,
      borrowerShouldReply: `I have unencumbered commercial shop premises worth ₹${(answers.collateralValue / 100000).toFixed(1)}L. Route this as a secured Loan Against Property (LAP) at ${finalBandLow}%–${finalBandHigh}% instead of unsecured credit.`,
    };
  } else if (answers.hasRecentBounces || (answers.hasExistingHighCostDebt && (answers.highCostDebtRate ?? 0) >= 25)) {
    counterScript = {
      ifLenderSays: `Lender or instant loan app offers fresh credit at 30%+ interest despite recent bounces.`,
      borrowerShouldReply: `I am declining all fresh borrowing to settle my existing ₹${(answers.highCostDebtAmount ?? 0).toLocaleString('en-IN')} high-cost debt and re-establish a 6-month clean payment record.`,
    };
  } else if (answers.creditScoreKnown && (answers.creditScore ?? 0) >= 750) {
    counterScript = {
      ifLenderSays: `Branch manager quotes 13.5%–15% citing standard personal loan card rates.`,
      borrowerShouldReply: `With my 780 CIBIL score and ${answers.tenureYearsInWork ?? 5} years at an MNC earning ₹${(answers.monthlyIncome / 100000).toFixed(1)}L net, fair tier-1 pricing is ${finalBandLow}%–${finalBandHigh}%. I have competing quotes near ${finalBandLow}%.`,
    };
  }

  return {
    verdict: {
      call: verdict.call,
      reason: verdict.reason,
      detailedWhy: verdict.detailedWhy,
      safeRecommendedAmount: verdict.safeRecommendedAmount,
    },
    maxAmount: {
      lenderLikely: foir.lenderLikelyMaxAmount,
      borrowerSafe: verdict.call === 'dont_borrow' ? 0 : foir.borrowerSafeMaxAmount,
      useThis: 'borrowerSafe',
      whyDifference: foir.whyDifference,
    },
    rate: {
      productRecommended: routing.productName,
      productCode: routing.productCode,
      securityType: routing.securityType,
      bandLow: finalBandLow,
      bandHigh: finalBandHigh,
      nominalRatePoint: routing.nominalPoint,
      aprAllIn: aprResult.apr,
      whySecuredOrUnsecured: routing.whySecuredOrUnsecured,
      feeBreakdown: `Upfront deduction: ₹${aprResult.upfrontCharges.toLocaleString('en-IN')} (${(RULES_CONFIG.CHARGES.TOTAL_UPFRONT_FEE_RATE * 100).toFixed(2)}% incl GST) on ₹${loanPrincipalToQuote.toLocaleString('en-IN')} principal -> Net cash in hand: ₹${aprResult.netDisbursal.toLocaleString('en-IN')}`,
    },
    emi: {
      ceiling: foir.projectedSafeEmiCeiling,
      recommendedTenureMonths: routing.recommendedTenure,
      tenureOptions,
      stressCase,
    },
    confidence: confidence.level,
    confidenceMultiplier: confidence.wideningMultiplier,
    questionsAnsweredCount: confidence.additionalAnsweredCount,
    traceability,
    negotiationCard: {
      targetProduct: routing.productName,
      fairRateRange: `${finalBandLow}% – ${finalBandHigh}%`,
      targetEmiCeiling: `₹${foir.projectedSafeEmiCeiling.toLocaleString('en-IN')}/mo`,
      safeLoanLimit: `₹${(foir.borrowerSafeMaxAmount / 100000).toFixed(1)}L (Lender max: ₹${(foir.lenderLikelyMaxAmount / 100000).toFixed(1)}L)`,
      keyLevers: keyLevers.length > 0 ? keyLevers : ['Stable disposable monthly surplus', 'Conservative debt-to-income profile'],
      counterScript,
    },
  };
}
