/**
 * borrower.ts
 * 
 * Core domain contracts and types for Borrower Copilot.
 * Pure TypeScript — no UI/React imports.
 */

export type EmploymentType = 'salaried' | 'self_employed' | 'informal';

export type LoanPurpose = 
  | 'wedding' 
  | 'business_expansion' 
  | 'vehicle' 
  | 'medical' 
  | 'home_renovation' 
  | 'debt_consolidation'
  | 'education'
  | 'consumption_other';

export type ProductType = 
  | 'personal_loan' 
  | 'lap' 
  | 'gold_loan' 
  | 'msme_business' 
  | 'two_wheeler';

export type CollateralType = 'property' | 'gold' | 'vehicle' | 'none';

export type VerdictCall = 'borrow' | 'borrow_less' | 'dont_borrow';

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface BorrowerAnswers {
  // Must questions (core 8-10)
  purpose: LoanPurpose;
  amountWanted: number;
  loanTypeWanted: ProductType;
  monthlyIncome: number;
  employmentType: EmploymentType;
  existingEmis: number;
  householdExpenses: number;
  age: number;
  creditScoreKnown: boolean;
  creditScore?: number | null; // null or undefined if unknown

  // Adaptive / Additional questions (branch specific)
  tenureYearsInWork?: number; // Job/business vintage in years
  variableIncomePercent?: number; // % of income that is variable/cash
  itrAnnualIncome?: number; // Official ITR filed per year (for self-employed)
  collateralType?: CollateralType;
  collateralValue?: number; // Stated market value of unencumbered asset
  hasRecentBounces?: boolean; // Any EMI or cheque bounce in last 6 months
  bouncesCount?: number;
  hasExistingHighCostDebt?: boolean; // High-cost apps/moneylenders >25%
  highCostDebtAmount?: number;
  highCostDebtRate?: number;
  emergencySavingsMonths?: number; // Liquid savings buffer in months
  coApplicantIncome?: number; // Monthly net earnings of co-applicant/spouse
  productiveLoan?: boolean; // Is the loan generating income?
  expectedMonthlyRevenueBoost?: number; // Expected incremental monthly income
  rentExpense?: number;
}

export interface TenureOption {
  months: number;
  emi: number;
  totalInterest: number;
  totalRepayment: number;
}

export interface FourOutputs {
  verdict: {
    call: VerdictCall;
    reason: string; // One concise sentence referencing specific borrower answers
    detailedWhy: string;
    safeRecommendedAmount: number;
  };
  maxAmount: {
    lenderLikely: number; // What a bank/NBFC model will sanction
    borrowerSafe: number; // What the borrower can safely carry
    useThis: 'borrowerSafe' | 'lenderLikely';
    whyDifference: string;
  };
  rate: {
    productRecommended: string; // e.g. "Loan Against Property (LAP)" or "Personal Loan"
    productCode: ProductType;
    securityType: 'secured' | 'unsecured';
    bandLow: number; // Lower bound of fair interest rate band (%)
    bandHigh: number; // Upper bound of fair interest rate band (%)
    nominalRatePoint: number; // Midpoint reference rate (%)
    aprAllIn: number; // All-in APR including processing fee & GST (%)
    whySecuredOrUnsecured: string;
    feeBreakdown: string;
  };
  emi: {
    ceiling: number; // Maximum safe monthly EMI
    recommendedTenureMonths: number;
    tenureOptions: TenureOption[];
    stressCase: {
      scenario: string; // e.g., "Income drops by 20%" or "Interest rate hikes by +200 bps"
      stressedMetric: string;
      bufferRemaining: number;
      isBreached: boolean;
      verdict: string;
    };
  };
  confidence: ConfidenceLevel;
  confidenceMultiplier: number;
  questionsAnsweredCount: number;
  traceability: string[]; // Explanations linking each output to specific inputs
  negotiationCard: {
    targetProduct: string;
    fairRateRange: string;
    targetEmiCeiling: string;
    safeLoanLimit: string;
    keyLevers: string[];
    counterScript: {
      ifLenderSays: string;
      borrowerShouldReply: string;
    };
  };
}
