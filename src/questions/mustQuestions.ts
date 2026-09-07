/**
 * mustQuestions.ts
 * 
 * The baseline 8-10 "Must" questions required to produce all four outputs.
 * If only these are answered, the app still functions with wide bands (Low confidence).
 */

import { BorrowerAnswers } from '../types/borrower.ts';

export interface QuestionOption<T = string | number | boolean> {
  label: string;
  value: T;
  hint?: string;
}

export interface QuestionDefinition {
  id: keyof BorrowerAnswers | string;
  field: keyof BorrowerAnswers;
  title: string;
  subtitle: string;
  type: 'currency' | 'number' | 'select' | 'radio' | 'boolean';
  options?: QuestionOption[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  unit?: string;
  helpText?: string;
}

export const MUST_QUESTIONS: QuestionDefinition[] = [
  {
    id: 'amountWanted',
    field: 'amountWanted',
    title: 'How much money are you looking to borrow?',
    subtitle: 'Enter the exact principal amount you need.',
    type: 'currency',
    min: 10000,
    max: 10000000,
    step: 5000,
    placeholder: 'e.g. 5,00,000',
    helpText: 'We will compute both what a lender will offer and what you can safely repay.',
  },
  {
    id: 'purpose',
    field: 'purpose',
    title: 'What is the primary purpose of this loan?',
    subtitle: 'Lenders price purpose differently; productive loans can qualify for relaxed limits.',
    type: 'radio',
    options: [
      { label: 'Wedding / Family Event', value: 'wedding', hint: 'Consumption loan' },
      { label: 'Business Expansion / Stock / Equipment', value: 'business_expansion', hint: 'Productive / MSME' },
      { label: 'Vehicle Purchase (EV / Bike / Car)', value: 'vehicle', hint: 'Vehicle hypothecation' },
      { label: 'Home Renovation / Repair', value: 'home_renovation', hint: 'Property improvement' },
      { label: 'Medical Emergency', value: 'medical', hint: 'Unforeseen health expense' },
      { label: 'Debt Consolidation / Pay Old Loans', value: 'debt_consolidation', hint: 'Replacing existing debt' },
      { label: 'Other Personal Expense', value: 'consumption_other', hint: 'General use' },
    ],
  },
  {
    id: 'employmentType',
    field: 'employmentType',
    title: 'How do you earn your monthly income?',
    subtitle: 'This adapts all upcoming questions to match your real cash flow pattern.',
    type: 'radio',
    options: [
      { label: 'Salaried (MNC, Corporate, Govt, Private)', value: 'salaried', hint: 'Fixed monthly bank salary' },
      { label: 'Self-Employed (Business, Kirana, Trader, Professional)', value: 'self_employed', hint: 'Business revenue or ITR' },
      { label: 'Informal / Gig (Delivery, Driver, Artisan, Cash Worker)', value: 'informal', hint: 'Daily/weekly gig or cash earnings' },
    ],
    helpText: 'Lenders evaluate salaried slips differently from shop revenue or gig platforms.',
  },
  {
    id: 'monthlyIncome',
    field: 'monthlyIncome',
    title: 'What is your net monthly take-home income?',
    subtitle: 'For salaried: net salary credited. For self-employed/gig: average monthly surplus.',
    type: 'currency',
    min: 10000,
    max: 2000000,
    step: 1000,
    placeholder: 'e.g. 60,000',
    helpText: 'Basis for FOIR debt-to-income affordability calculations.',
  },
  {
    id: 'existingEmis',
    field: 'existingEmis',
    title: 'Total monthly EMIs you are currently paying',
    subtitle: 'Include all existing car, two-wheeler, personal, or app loans.',
    type: 'currency',
    min: 0,
    max: 1000000,
    step: 500,
    placeholder: '0 if none',
    helpText: 'Existing EMIs consume debt capacity before a new loan can be sanctioned.',
  },
  {
    id: 'householdExpenses',
    field: 'householdExpenses',
    title: 'Average monthly living expenses',
    subtitle: 'Groceries, utilities, children school fees, medicines, food.',
    type: 'currency',
    min: 5000,
    max: 1000000,
    step: 500,
    placeholder: 'e.g. 25,000',
    helpText: 'Used to calculate your safety cash buffer after loan payments.',
  },
  {
    id: 'age',
    field: 'age',
    title: 'What is your age?',
    subtitle: 'Lenders restrict loan tenure so it completes before retirement age (60–65).',
    type: 'number',
    min: 21,
    max: 70,
    step: 1,
    placeholder: 'e.g. 32',
    unit: 'years',
  },
  {
    id: 'creditScore',
    field: 'creditScore',
    title: 'Do you know your CIBIL / Experian credit score?',
    subtitle: 'Unknown is never assumed as zero or bad credit — we use proxy stability signals.',
    type: 'radio',
    options: [
      { label: '750 or above (Excellent)', value: 780, hint: 'Tier-1 prime pricing' },
      { label: '700 – 749 (Good)', value: 720, hint: 'Standard bank pricing' },
      { label: '650 – 699 (Average)', value: 675, hint: 'NBFC pricing bracket' },
      { label: 'Below 650 (Poor / Default history)', value: 620, hint: 'High risk / fintech' },
      { label: 'I do not know / Never taken formal credit', value: -1, hint: 'No credit history (Thin file)' },
    ],
  },
];
