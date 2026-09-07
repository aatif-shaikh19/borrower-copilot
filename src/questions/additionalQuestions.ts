/**
 * additionalQuestions.ts
 * 
 * Branch-specific adaptive questions.
 * Every single question here directly moves an output or tightens confidence bands.
 * Explicit comments note the exact rules/*.ts function that consumes the answer.
 */

import { QuestionDefinition } from './mustQuestions.ts';

// ----------------------------------------------------------------------------
// Branch: Salaried (e.g. Priya)
// ----------------------------------------------------------------------------
export const SALARIED_ADDITIONAL_QUESTIONS: QuestionDefinition[] = [
  {
    // Consumed by: routing.ts (tenure proxy if score unknown) & rules/index.ts (negotiation lever)
    id: 'tenureYearsInWork',
    field: 'tenureYearsInWork',
    title: 'How many continuous years have you worked at your current company/industry?',
    subtitle: 'Stable tenure (>3 years) at a recognized employer signals low credit risk to lenders.',
    type: 'number',
    min: 0,
    max: 40,
    step: 1,
    placeholder: 'e.g. 5',
    unit: 'years',
    helpText: 'Lenders offer discounts of 0.5%–1.5% for >3 years stability at large companies.',
  },
  {
    // Consumed by: foir.ts (calculateFoirAndAffordability: subtracted in living buffer calculation)
    id: 'rentExpense',
    field: 'rentExpense',
    title: 'How much do you pay in monthly house rent?',
    subtitle: 'If you own your home or live with family, enter 0.',
    type: 'currency',
    min: 0,
    max: 300000,
    step: 1000,
    placeholder: 'e.g. 28,000',
    helpText: 'Rent is an unavoidable fixed outflow that directly reduces your safe EMI buffer.',
  },
  {
    // Consumed by: confidence.ts (evaluateConfidence) & rules/index.ts (liquidity assessment)
    id: 'emergencySavingsMonths',
    field: 'emergencySavingsMonths',
    title: 'How many months of basic living expenses do you hold in liquid savings or FDs?',
    subtitle: 'Having a 3–6 month emergency fund protects you if you face unexpected layoff or illness.',
    type: 'number',
    min: 0,
    max: 36,
    step: 1,
    placeholder: 'e.g. 4',
    unit: 'months',
    helpText: 'Borrowers with <2 months savings should not take loans close to their max limit.',
  },
  {
    // Consumed by: foir.ts (calculateFoirAndAffordability: expands effective household income)
    id: 'coApplicantIncome',
    field: 'coApplicantIncome',
    title: 'Does a spouse or family member earn income and agree to co-apply?',
    subtitle: 'Enter their monthly take-home income. Enter 0 if applying solo.',
    type: 'currency',
    min: 0,
    max: 1000000,
    step: 1000,
    placeholder: '0 if none',
    helpText: 'Adding a co-applicant can increase your lender sanction limit by up to 60%.',
  },
  {
    // Consumed by: verdict.ts (evaluateVerdict: triggers hard 'dont_borrow' if true)
    id: 'hasRecentBounces',
    field: 'hasRecentBounces',
    title: 'Have you had any EMI, credit card, or cheque bounce in the last 6 months?',
    subtitle: 'Be honest. Lenders see every bounce on the bureau immediately.',
    type: 'radio',
    options: [
      { label: 'No, clean payment record with zero bounces', value: false },
      { label: 'Yes, 1 or more bounces in the past 6 months', value: true },
    ],
    helpText: 'A recent bounce will cause immediate rejection or push you into subprime rates.',
  },
];

// ----------------------------------------------------------------------------
// Branch: Self-Employed (e.g. Ravi)
// ----------------------------------------------------------------------------
export const SELF_EMPLOYED_ADDITIONAL_QUESTIONS: QuestionDefinition[] = [
  {
    // Consumed by: routing.ts (vintage proxy) & rules/index.ts (business stability lever)
    id: 'tenureYearsInWork',
    field: 'tenureYearsInWork',
    title: 'How many years has your business or shop been actively operating?',
    subtitle: 'Business vintage over 3–5 years proves commercial resilience.',
    type: 'number',
    min: 0,
    max: 50,
    step: 1,
    placeholder: 'e.g. 14',
    unit: 'years',
  },
  {
    // Consumed by: confidence.ts & foir.ts (official income baseline)
    id: 'itrAnnualIncome',
    field: 'itrAnnualIncome',
    title: 'What is the gross total income declared on your latest ITR (Income Tax Return)?',
    subtitle: 'Banks underwrite self-employed loans based on documented ITR figures, not unbanked cash.',
    type: 'currency',
    min: 0,
    max: 50000000,
    step: 25000,
    placeholder: 'e.g. 4,20,000',
    helpText: 'If cash profit exceeds ITR profit, lenders heavily haircut unrecorded earnings.',
  },
  {
    // Consumed by: routing.ts (triggers LAP/Gold secured routing) & foir.ts (LTV limit)
    id: 'collateralValue',
    field: 'collateralValue',
    title: 'Estimated market value of unencumbered property (shop/house/land) or gold you own',
    subtitle: 'Unencumbered means no existing loan or mortgage is active against this asset.',
    type: 'currency',
    min: 0,
    max: 100000000,
    step: 50000,
    placeholder: 'e.g. 45,00,000',
    helpText: 'Property or gold worth 2x your loan can cut your interest rate by 6–10%!',
  },
  {
    // Consumed by: foir.ts (calculateFoirAndAffordability: adds co-applicant earnings e.g. Ravi wife)
    id: 'coApplicantIncome',
    field: 'coApplicantIncome',
    title: 'Spouse or co-borrower monthly income',
    subtitle: 'e.g. teaching, salaried job, or second business income.',
    type: 'currency',
    min: 0,
    max: 500000,
    step: 1000,
    placeholder: 'e.g. 18,000',
  },
  {
    // Consumed by: foir.ts (calculateFoirAndAffordability: +5pp safe FOIR boost if true)
    id: 'productiveLoan',
    field: 'productiveLoan',
    title: 'Will this loan directly generate new business revenue (stock, vehicle, tools)?',
    subtitle: 'Productive loans pay for themselves; consumption loans only add debt service.',
    type: 'radio',
    options: [
      { label: 'Yes, it expands stock/delivery and generates new income', value: true },
      { label: 'No, it is for personal or general expenses', value: false },
    ],
  },
];

// ----------------------------------------------------------------------------
// Branch: Informal / Gig Worker (e.g. Anita)
// ----------------------------------------------------------------------------
export const INFORMAL_ADDITIONAL_QUESTIONS: QuestionDefinition[] = [
  {
    // Consumed by: foir.ts (tightens borrowerSafeFoir to 25% if >30%) & rules/index.ts (stress case)
    id: 'variableIncomePercent',
    field: 'variableIncomePercent',
    title: 'What percentage of your monthly income varies depending on trips, gigs, or seasons?',
    subtitle: 'Irregular income requires a much larger safety buffer for slow weeks or monsoon seasons.',
    type: 'number',
    min: 0,
    max: 100,
    step: 5,
    placeholder: 'e.g. 60',
    unit: '%',
    helpText: 'If over 30% of income is variable, your safe debt ceiling is capped at 25% FOIR.',
  },
  {
    // Consumed by: verdict.ts (evaluateVerdict: triggers hard 'dont_borrow' if true)
    id: 'hasRecentBounces',
    field: 'hasRecentBounces',
    title: 'Have you missed or bounced any loan payment in the last 6 months?',
    subtitle: 'Did an auto-debit fail, or did a lender or collection agent contact you for overdue payment?',
    type: 'radio',
    options: [
      { label: 'Yes, I missed or bounced at least 1 payment recently', value: true },
      { label: 'No, all payments were paid on time', value: false },
    ],
    helpText: 'A recent bounce indicates your current cash flow is already under water.',
  },
  {
    // Consumed by: verdict.ts (evaluateVerdict: triggers hard 'dont_borrow' for high-cost debt >25%)
    id: 'highCostDebtAmount',
    field: 'highCostDebtAmount',
    title: 'Do you have outstanding balances on instant app loans, 7-day credit, or private lenders?',
    subtitle: 'Enter the total principal balance across all short-term app loans.',
    type: 'currency',
    min: 0,
    max: 500000,
    step: 1000,
    placeholder: 'e.g. 35,000 (0 if none)',
    helpText: 'Instant digital app loans charge 30%–120% APR. Resolving these is priority #1.',
  },
  {
    // Consumed by: foir.ts (+5pp safe FOIR boost) & verdict.ts (economic purpose evaluation)
    id: 'productiveLoan',
    field: 'productiveLoan',
    title: 'Will this loan purchase an asset that increases your daily earnings (e.g. EV scooter)?',
    subtitle: 'Productive tools allow you to make more deliveries or take more orders.',
    type: 'radio',
    options: [
      { label: 'Yes, it directly increases my daily delivery/work capacity', value: true },
      { label: 'No, it is for living costs or emergency expenses', value: false },
    ],
  },
];
