/**
 * personas.test.ts
 * 
 * Strict automated test suite running Priya, Ravi, and Anita through the rules engine.
 * Validates domain math, product routing, verdict priority, and explainability.
 * Zero UI/React imports. Run with `npm test`.
 */

import { describe, it, expect } from 'vitest';
import { evaluate } from '../index.ts';
import { BorrowerAnswers } from '../../types/borrower.ts';

describe('Borrower Copilot — Persona Validation Tests', () => {
  // --------------------------------------------------------------------------
  // Persona 1: Priya, 29 (Bengaluru, Salaried IT)
  // --------------------------------------------------------------------------
  const priyaAnswers: BorrowerAnswers = {
    purpose: 'wedding',
    amountWanted: 800000, // ₹8,00,000 personal loan
    loanTypeWanted: 'personal_loan',
    monthlyIncome: 110000, // Net ₹1,10,000/mo
    employmentType: 'salaried',
    existingEmis: 14000, // Car loan EMI ₹14,000 (2 years left)
    householdExpenses: 25000,
    rentExpense: 28000, // Rents at ₹28,000
    age: 29,
    creditScoreKnown: true,
    creditScore: 780, // Prime credit score
    tenureYearsInWork: 5, // 5 years at MNC
    emergencySavingsMonths: 4,
    hasRecentBounces: false,
  };

  it('Priya: gets "borrow" verdict, lender max != safe carry, prime personal loan rate', () => {
    const outputs = evaluate(priyaAnswers);

    // 1. Verdict
    expect(outputs.verdict.call).toBe('borrow');
    expect(outputs.verdict.reason).toContain('8.0L');

    // 2. Max Amounts (Lender vs Safe)
    // Lender pushes up to 50% FOIR (₹41,000/mo headroom -> >₹15L capacity)
    // Safe FOIR is 35% (₹24,500/mo headroom -> ~₹9L capacity)
    expect(outputs.maxAmount.lenderLikely).toBeGreaterThan(outputs.maxAmount.borrowerSafe);
    expect(outputs.maxAmount.borrowerSafe).toBeGreaterThanOrEqual(800000);
    expect(outputs.maxAmount.useThis).toBe('borrowerSafe');

    // 3. Product & Rate Routing
    expect(outputs.rate.productCode).toBe('personal_loan');
    expect(outputs.rate.securityType).toBe('unsecured');
    // Prime tier (780 CIBIL) baseline band: 10.0%–12.0%
    expect(outputs.rate.bandLow).toBeLessThanOrEqual(10.5);
    expect(outputs.rate.bandHigh).toBeLessThanOrEqual(13.0);
    // True All-In APR includes upfront processing fees, so APR > nominal rate
    expect(outputs.rate.aprAllIn).toBeGreaterThan(outputs.rate.nominalRatePoint);

    // 4. Safe EMI & Stress
    expect(outputs.emi.ceiling).toBeGreaterThan(15000);
    expect(outputs.emi.tenureOptions.length).toBeGreaterThanOrEqual(3);

    // 5. Traceability
    expect(outputs.traceability.length).toBe(4);
    outputs.traceability.forEach((trace) => {
      expect(typeof trace).toBe('string');
      expect(trace.length).toBeGreaterThan(15);
    });

    // 6. Negotiation Card
    expect(outputs.negotiationCard.keyLevers.some(lever => lever.includes('780'))).toBe(true);
    expect(outputs.negotiationCard.counterScript.borrowerShouldReply).toContain('CIBIL');
  });

  // --------------------------------------------------------------------------
  // Persona 2: Ravi, 42 (Mysuru, Self-Employed Kirana Store)
  // --------------------------------------------------------------------------
  const raviAnswers: BorrowerAnswers = {
    purpose: 'business_expansion',
    amountWanted: 1500000, // ₹15,00,000 for stock + delivery vehicle
    loanTypeWanted: 'msme_business',
    monthlyIncome: 60000, // Cash ₹40k–80k/mo (midpoint ₹60,000)
    coApplicantIncome: 18000, // Wife earns ₹18,000 teaching
    employmentType: 'self_employed',
    existingEmis: 0, // Never taken formal credit
    householdExpenses: 28000,
    age: 42,
    creditScoreKnown: false, // No credit score (thin file)
    creditScore: null,
    tenureYearsInWork: 14, // Kirana store for 14 years
    itrAnnualIncome: 420000, // ₹4.2L/yr ITR
    collateralType: 'property', // Owns shop premises
    collateralValue: 4500000, // ₹45,00,000 unencumbered
    productiveLoan: true,
    expectedMonthlyRevenueBoost: 20000,
  };

  it('Ravi: MUST route to secured LAP (not unsecured loan), saving substantial interest', () => {
    const outputs = evaluate(raviAnswers);

    // 1. Secured Routing Check
    // Ravi owns ₹45L unencumbered shop premises (3x the ₹15L ask).
    // The engine MUST route him to LAP, saving 8–10% interest over unsecured business/personal loans.
    expect(outputs.rate.productCode).toBe('lap');
    expect(outputs.rate.securityType).toBe('secured');
    expect(outputs.rate.productRecommended).toContain('Property');

    // 2. Rate Band for LAP (9.5%–14%) vs Unsecured (18%–26%)
    expect(outputs.rate.bandLow).toBeLessThanOrEqual(10.0);
    expect(outputs.rate.bandHigh).toBeLessThanOrEqual(14.5);

    // 3. Why explanation mentions collateral
    expect(outputs.rate.whySecuredOrUnsecured).toContain('45.0L');

    // 4. Negotiation Card counter-script specifically mentions commercial shop premises
    expect(outputs.negotiationCard.counterScript.borrowerShouldReply).toContain('Loan Against Property');
    expect(outputs.negotiationCard.counterScript.borrowerShouldReply).toContain('45.0L');
  });

  // --------------------------------------------------------------------------
  // Persona 3: Anita, 35 (Hubballi, Informal Delivery + Tailoring)
  // --------------------------------------------------------------------------
  const anitaAnswers: BorrowerAnswers = {
    purpose: 'vehicle',
    amountWanted: 150000, // ₹1,50,000 for EV scooter
    loanTypeWanted: 'two_wheeler',
    monthlyIncome: 28000, // ₹26k–30k/mo
    employmentType: 'informal',
    existingEmis: 4500, // 3 app loans totaling ₹35,000
    householdExpenses: 20000, // 2 kids, husband unemployed 8 months
    age: 35,
    creditScoreKnown: false, // Unknown
    creditScore: null,
    variableIncomePercent: 60, // High variable gig income
    hasRecentBounces: true, // One bounce last month!
    bouncesCount: 1,
    hasExistingHighCostDebt: true, // 3 app loans at 30%+
    highCostDebtAmount: 35000,
    highCostDebtRate: 32, // 30%+ interest
    productiveLoan: true,
    expectedMonthlyRevenueBoost: 8000, // Double delivery runs
  };

  it('Anita: MUST trigger "dont_borrow" verdict due to recent bounce and 30%+ app debt', () => {
    const outputs = evaluate(anitaAnswers);

    // 1. Hard Verdict requirement: MUST NOT be "borrow"
    expect(outputs.verdict.call).toBe('dont_borrow');

    // 2. Reason must cite the bounce or high-cost debt explicitly
    const reasonText = outputs.verdict.reason.toLowerCase();
    const hasBounceMention = reasonText.includes('bounce');
    const hasHighCostMention = reasonText.includes('32%') || reasonText.includes('existing debt') || reasonText.includes('high-cost');
    expect(hasBounceMention || hasHighCostMention).toBe(true);

    // 3. Safe carry amount should be 0 because new debt is dangerous
    expect(outputs.verdict.safeRecommendedAmount).toBe(0);

    // 4. Counter-script advises declining fresh debt and resolving app loans first
    expect(outputs.negotiationCard.counterScript.borrowerShouldReply).toContain('declining all fresh borrowing');
  });

  // --------------------------------------------------------------------------
  // Test 4: Confidence Widening ("Confidence widens with silence")
  // --------------------------------------------------------------------------
  it('Confidence model widens rate bands when additional questions are unanswered', () => {
    const minimalPriya: BorrowerAnswers = {
      purpose: 'wedding',
      amountWanted: 800000,
      loanTypeWanted: 'personal_loan',
      monthlyIncome: 110000,
      employmentType: 'salaried',
      existingEmis: 14000,
      householdExpenses: 25000,
      age: 29,
      creditScoreKnown: false, // Silence on credit score
      // Zero additional questions answered
    };

    const minimalOutputs = evaluate(minimalPriya);
    const fullOutputs = evaluate(priyaAnswers);

    // Low confidence for minimal answers
    expect(minimalOutputs.confidence).toBe('low');
    // High confidence for detailed answers
    expect(fullOutputs.confidence).toBe('high');

    // Minimal answers produce a wider interest rate band
    const minimalBandSpan = minimalOutputs.rate.bandHigh - minimalOutputs.rate.bandLow;
    const fullBandSpan = fullOutputs.rate.bandHigh - fullOutputs.rate.bandLow;
    expect(minimalBandSpan).toBeGreaterThan(fullBandSpan);
  });
});
