/**
 * rulesConfig.ts
 * 
 * Every constant from docs/RULES.md lives ONLY here.
 * This file and RULES.md must match line-for-line.
 * Zero imports from React or any UI library.
 */

export const RULES_CONFIG = {
  // §1. Income & affordability (FOIR)
  FOIR: {
    LENDER_CEILING_SALARIED: 0.50, // Typical bank/NBFC ceiling for salaried unsecured [SRC]
    LENDER_CEILING_SALARIED_HIGH_INCOME: 0.60, // Lenders relax for high disposable income [SRC + JDG]
    SALARIED_HIGH_INCOME_THRESHOLD: 150000, // Monthly net income > ₹1.5L
    LENDER_CEILING_SELF_EMPLOYED: 0.45, // Lenders discount undocumented income [SRC]
    LENDER_CEILING_SECURED: 0.65, // Collateral tolerates higher ratio [SRC]
    BORROWER_SAFE_DEFAULT: 0.35, // Leaves ~65% for living + savings [JDG]
    BORROWER_SAFE_INFORMAL: 0.25, // For irregular/cash income (>30% variable) [JDG]
    PRODUCTIVE_PURPOSE_BOOST: 0.05, // +5pp if loan generates income with expected return [JDG]
    MIN_RESIDUAL_BUFFER_ABSOLUTE: 5000, // ₹5,000/month absolute safety buffer [JDG]
    MIN_RESIDUAL_BUFFER_RATIO: 0.15, // 15% of net income [JDG]
  },

  // §2. Interest rate bands by product (mid-2026, % per annum nominal)
  RATES: {
    PERSONAL_LOAN: {
      CIBIL_750_PLUS: { low: 10.0, high: 12.0 },
      CIBIL_700_749: { low: 12.0, high: 16.0 },
      CIBIL_650_699: { low: 16.0, high: 24.0 },
      CIBIL_BELOW_650_OR_UNKNOWN: { low: 24.0, high: 36.0 },
    },
    LAP: {
      SALARIED: { low: 8.5, high: 12.5 },
      SELF_EMPLOYED: { low: 9.5, high: 14.0 },
    },
    GOLD_LOAN: {
      BANK: { low: 8.5, high: 14.0 },
      NBFC: { low: 12.0, high: 24.0 },
    },
    MSME_SECURED: { low: 7.5, high: 13.0 },
    MSME_UNSECURED: { low: 14.0, high: 24.0 },
    TWO_WHEELER: {
      PRIME: { low: 8.5, high: 16.0 },
      INFORMAL_NBFC: { low: 18.0, high: 26.0 },
    },
    APP_LOAN_HIGH_COST_FLAG: 25.0, // Existing debt >25% triggers warning / reject [SRC]
  },

  // §3. LTV limits (secured products)
  LTV: {
    GOLD_UNDER_2_5L: 0.85, // RBI April 2026 tiered rule [SRC]
    GOLD_2_5L_TO_5L: 0.80, // RBI April 2026 tiered rule [SRC]
    GOLD_ABOVE_5L: 0.75, // RBI April 2026 tiered rule [SRC]
    LAP_ASSUMED_VALUATION_FACTOR: 0.60, // Conservative 60% of stated property value [JDG]
    VEHICLE_HYPOTHECATION: 0.85, // 85% of on-road vehicle cost [SRC]
  },

  // §4. Upfront fees & charges
  CHARGES: {
    PROCESSING_FEE_RATE: 0.015, // 1.5% typical processing fee [SRC]
    GST_ON_FEE: 0.18, // 18% GST on processing fee [SRC]
    TOTAL_UPFRONT_FEE_RATE: 0.0177, // 1.5% * 1.18 = 1.77% effective deduction [SRC]
  },

  // §5. Credit score thresholds
  CREDIT_TIERS: {
    EXCELLENT_MIN: 750,
    GOOD_MIN: 700,
    FAIR_MIN: 650,
  },

  // §6. Verdict conditions
  VERDICT: {
    HIGH_COST_DEBT_THRESHOLD: 25.0, // % interest rate on existing debt [JDG]
    DELINQUENCY_WINDOW_MONTHS: 6, // Past bounce within last 6 months [JDG]
  },

  // §7. Product routing thresholds
  ROUTING: {
    COLLATERAL_TO_LOAN_MULTIPLE: 2.0, // Collateral value >= 2x loan ask triggers secured route [JDG]
  },

  // §8. Confidence model
  CONFIDENCE: {
    LOW_WIDENING_FACTOR: 0.30, // ±30% widening with must-questions only [JDG]
    MEDIUM_WIDENING_FACTOR: 0.20, // ±20% widening with partial additional answers [JDG]
    HIGH_WIDENING_FACTOR: 0.10, // ±10% widening with thorough answers [JDG]
    QUESTIONS_FOR_MEDIUM: 2, // At least 2 branch questions answered [JDG]
    QUESTIONS_FOR_HIGH: 3, // At least 3 branch questions answered [JDG]
  },

  // §9. Stress testing
  STRESS: {
    INCOME_DROP_PERCENT: 0.20, // 20% income reduction scenario [JDG]
    RATE_HIKE_PERCENT: 2.0, // 2.0 percentage point rate increase (+200 bps) [JDG]
  },

  // Standard tenure assumptions (months)
  DEFAULT_TENURES: {
    PERSONAL_LOAN: [24, 36, 48, 60],
    LAP: [60, 84, 120, 180],
    TWO_WHEELER: [12, 24, 36, 48],
    BUSINESS_LOAN: [24, 36, 48, 60],
  }
} as const;

export type RulesConfigType = typeof RULES_CONFIG;
