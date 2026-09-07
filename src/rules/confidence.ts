/**
 * confidence.ts
 * 
 * Computes confidence rating (low, medium, high) and band widening factors.
 * Follows the core tenet: "Confidence widens with silence."
 * If the borrower answers only the base must-questions, ranges remain wide (±30%).
 * As specific branch questions are answered, the confidence tightens to ±20% or ±10%.
 * Zero UI/React imports.
 */

import { BorrowerAnswers, ConfidenceLevel } from '../types/borrower.ts';
import { RULES_CONFIG } from './rulesConfig.ts';

export interface ConfidenceResult {
  level: ConfidenceLevel;
  wideningMultiplier: number;
  additionalAnsweredCount: number;
  explanation: string;
}

/**
 * Counts how many relevant additional/adaptive questions were answered with non-default values.
 */
export function countAnsweredAdditionalQuestions(answers: BorrowerAnswers): number {
  let count = 0;

  if (answers.tenureYearsInWork !== undefined && answers.tenureYearsInWork > 0) count++;
  if (answers.variableIncomePercent !== undefined) count++;
  if (answers.itrAnnualIncome !== undefined && answers.itrAnnualIncome > 0) count++;
  if (answers.collateralValue !== undefined && answers.collateralValue > 0) count++;
  if (answers.hasRecentBounces !== undefined) count++;
  if (answers.hasExistingHighCostDebt !== undefined) count++;
  if (answers.emergencySavingsMonths !== undefined && answers.emergencySavingsMonths > 0) count++;
  if (answers.coApplicantIncome !== undefined && answers.coApplicantIncome > 0) count++;
  if (answers.productiveLoan !== undefined) count++;
  if (answers.rentExpense !== undefined && answers.rentExpense > 0) count++;

  return count;
}

export function evaluateConfidence(answers: BorrowerAnswers): ConfidenceResult {
  const answeredCount = countAnsweredAdditionalQuestions(answers);

  if (answeredCount >= RULES_CONFIG.CONFIDENCE.QUESTIONS_FOR_HIGH) {
    return {
      level: 'high',
      wideningMultiplier: RULES_CONFIG.CONFIDENCE.HIGH_WIDENING_FACTOR,
      additionalAnsweredCount: answeredCount,
      explanation: `High confidence: You answered ${answeredCount} detailed profile questions. Ranges are tightened to ±10% precision based on verified cash-flow and asset signals.`,
    };
  }

  if (answeredCount >= RULES_CONFIG.CONFIDENCE.QUESTIONS_FOR_MEDIUM) {
    return {
      level: 'medium',
      wideningMultiplier: RULES_CONFIG.CONFIDENCE.MEDIUM_WIDENING_FACTOR,
      additionalAnsweredCount: answeredCount,
      explanation: `Medium confidence: You answered ${answeredCount} additional questions. Estimates have a ±20% band. Answering further questions will tighten your rate band.`,
    };
  }

  return {
    level: 'low',
    wideningMultiplier: RULES_CONFIG.CONFIDENCE.LOW_WIDENING_FACTOR,
    additionalAnsweredCount: answeredCount,
    explanation: `Low confidence (Silence penalty): You answered only the baseline questions. Bands are widened by ±30% to account for unknown income stability, bounce history, and asset details.`,
  };
}
