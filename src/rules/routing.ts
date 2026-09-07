/**
 * routing.ts
 * 
 * Product routing and fair interest rate band determination.
 * Evaluates whether a borrower should be routed to a cheaper secured product (LAP, Gold)
 * or specialized product (EV/Two-wheeler) instead of an expensive unsecured loan.
 * Zero UI/React imports.
 */

import { BorrowerAnswers, ProductType } from '../types/borrower.ts';
import { RULES_CONFIG } from './rulesConfig.ts';

export interface RoutingResult {
  productCode: ProductType;
  productName: string;
  securityType: 'secured' | 'unsecured';
  bandLow: number;
  bandHigh: number;
  nominalPoint: number;
  whySecuredOrUnsecured: string;
  tenuresAvailable: number[];
  recommendedTenure: number;
}

export function determineProductRouting(answers: BorrowerAnswers): RoutingResult {
  const {
    purpose,
    loanTypeWanted,
    amountWanted,
    collateralType,
    collateralValue = 0,
    employmentType,
    creditScoreKnown,
    creditScore,
    tenureYearsInWork = 0,
  } = answers;

  const hasSubstantialCollateral =
    collateralValue >= amountWanted * RULES_CONFIG.ROUTING.COLLATERAL_TO_LOAN_MULTIPLE;

  // 1. Check Collateral-First Routing (e.g. Ravi with shop premises worth ₹45L vs ₹15L ask)
  if (
    hasSubstantialCollateral &&
    (collateralType === 'property' || collateralType === 'gold')
  ) {
    if (collateralType === 'property') {
      const band =
        employmentType === 'self_employed'
          ? RULES_CONFIG.RATES.LAP.SELF_EMPLOYED
          : RULES_CONFIG.RATES.LAP.SALARIED;

      return {
        productCode: 'lap',
        productName: 'Loan Against Property (LAP)',
        securityType: 'secured',
        bandLow: band.low,
        bandHigh: band.high,
        nominalPoint: Math.round(((band.low + band.high) / 2) * 10) / 10,
        whySecuredOrUnsecured: `You have unencumbered property worth ₹${(collateralValue / 100000).toFixed(1)}L (${(collateralValue / amountWanted).toFixed(1)}x your loan ask). Routing as a secured LAP cuts your interest rate by 6–10% compared to unsecured loans and avoids bureau-score rejection.`,
        tenuresAvailable: [...RULES_CONFIG.DEFAULT_TENURES.LAP],
        recommendedTenure: 84, // 7 years comfortable tenure for LAP
      };
    }

    if (collateralType === 'gold') {
      const band = RULES_CONFIG.RATES.GOLD_LOAN.BANK;
      return {
        productCode: 'gold_loan',
        productName: 'Gold Loan (Bank/Tier-1)',
        securityType: 'secured',
        bandLow: band.low,
        bandHigh: band.high,
        nominalPoint: Math.round(((band.low + band.high) / 2) * 10) / 10,
        whySecuredOrUnsecured: `Your pledged gold collateral qualifies for lower bank interest rates (8.5–14%) with minimal credit score underwriting.`,
        tenuresAvailable: [12, 24, 36],
        recommendedTenure: 24,
      };
    }
  }

  // 2. Vehicle Loan Routing (e.g. Scooter / Delivery vehicle)
  if (purpose === 'vehicle' || loanTypeWanted === 'two_wheeler') {
    const isPrime =
      employmentType === 'salaried' &&
      creditScoreKnown &&
      (creditScore ?? 0) >= RULES_CONFIG.CREDIT_TIERS.GOOD_MIN;

    const band = isPrime
      ? RULES_CONFIG.RATES.TWO_WHEELER.PRIME
      : RULES_CONFIG.RATES.TWO_WHEELER.INFORMAL_NBFC;

    return {
      productCode: 'two_wheeler',
      productName: 'Two-Wheeler / EV Hypothecation Loan',
      securityType: 'secured',
      bandLow: band.low,
      bandHigh: band.high,
      nominalPoint: Math.round(((band.low + band.high) / 2) * 10) / 10,
      whySecuredOrUnsecured: `A vehicle loan hypothecates the vehicle as security, which qualifies for a 8–26% rate, preventing you from being forced into 30%+ personal/app credit.`,
      tenuresAvailable: [...RULES_CONFIG.DEFAULT_TENURES.TWO_WHEELER],
      recommendedTenure: 36,
    };
  }

  // 3. Business / MSME Loan Routing
  if (purpose === 'business_expansion' || loanTypeWanted === 'msme_business') {
    if (collateralValue > 0) {
      const band = RULES_CONFIG.RATES.MSME_SECURED;
      return {
        productCode: 'msme_business',
        productName: 'Secured MSME Business Loan',
        securityType: 'secured',
        bandLow: band.low,
        bandHigh: band.high,
        nominalPoint: Math.round(((band.low + band.high) / 2) * 10) / 10,
        whySecuredOrUnsecured: `Secured business facilities provide priority sector rates (7.5–13%) backed by business assets.`,
        tenuresAvailable: [...RULES_CONFIG.DEFAULT_TENURES.BUSINESS_LOAN],
        recommendedTenure: 48,
      };
    } else {
      const band = RULES_CONFIG.RATES.MSME_UNSECURED;
      return {
        productCode: 'msme_business',
        productName: 'Unsecured Business Loan',
        securityType: 'unsecured',
        bandLow: band.low,
        bandHigh: band.high,
        nominalPoint: Math.round(((band.low + band.high) / 2) * 10) / 10,
        whySecuredOrUnsecured: `Unsecured business loans require strong cash flow or ITR history; rates range between 14–24%.`,
        tenuresAvailable: [...RULES_CONFIG.DEFAULT_TENURES.BUSINESS_LOAN],
        recommendedTenure: 36,
      };
    }
  }

  // 4. Default: Personal Loan (Unsecured)
  let band = RULES_CONFIG.RATES.PERSONAL_LOAN.CIBIL_750_PLUS;
  let why = '';

  if (creditScoreKnown && creditScore !== null && creditScore !== undefined) {
    if (creditScore >= RULES_CONFIG.CREDIT_TIERS.EXCELLENT_MIN) {
      band = RULES_CONFIG.RATES.PERSONAL_LOAN.CIBIL_750_PLUS;
      why = `With an excellent credit score of ${creditScore} and steady salaried employment, you qualify for prime bank pricing (10.0–12.0%).`;
    } else if (creditScore >= RULES_CONFIG.CREDIT_TIERS.GOOD_MIN) {
      band = RULES_CONFIG.RATES.PERSONAL_LOAN.CIBIL_700_749;
      why = `A credit score of ${creditScore} puts you in the standard bank/NBFC bracket (12.0–16.0%).`;
    } else if (creditScore >= RULES_CONFIG.CREDIT_TIERS.FAIR_MIN) {
      band = RULES_CONFIG.RATES.PERSONAL_LOAN.CIBIL_650_699;
      why = `A credit score of ${creditScore} shifts primary eligibility to NBFCs with higher risk margins (16.0–24.0%).`;
    } else {
      band = RULES_CONFIG.RATES.PERSONAL_LOAN.CIBIL_BELOW_650_OR_UNKNOWN;
      why = `A credit score below 650 restricts formal bank options; quotes will be high-cost NBFC/fintech rates (24.0–36.0%).`;
    }
  } else {
    // Credit score UNKNOWN: Not modeled as 300 / bad credit!
    // We check proxy signals: vintage, employment type
    if (employmentType === 'salaried' && tenureYearsInWork >= 3) {
      // Good proxy signal
      band = { low: 12.0, high: 18.0 };
      why = `Your credit score is unknown. We do not penalize you as poor credit; your ${tenureYearsInWork} years of employment provides a stability proxy (12.0–18.0%).`;
    } else {
      band = { low: 16.0, high: 28.0 };
      why = `Your credit score is unknown. The app models this as an unverified profile with a wider band (16.0–28.0%) rather than assuming default.`;
    }
  }

  return {
    productCode: 'personal_loan',
    productName: 'Personal Loan (Unsecured)',
    securityType: 'unsecured',
    bandLow: band.low,
    bandHigh: band.high,
    nominalPoint: Math.round(((band.low + band.high) / 2) * 10) / 10,
    whySecuredOrUnsecured: why,
    tenuresAvailable: [...RULES_CONFIG.DEFAULT_TENURES.PERSONAL_LOAN],
    recommendedTenure: 48,
  };
}
