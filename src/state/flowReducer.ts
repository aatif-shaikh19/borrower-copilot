/**
 * flowReducer.ts
 * 
 * In-memory state machine for question flow navigation and real-time evaluation.
 * Automatically triggers evaluate(answers) whenever answers change.
 * Zero persistence (no localStorage, no cookies) ensuring strict financial privacy.
 */

import { BorrowerAnswers, FourOutputs, ProductType } from '../types/borrower.ts';
import { MUST_QUESTIONS, QuestionDefinition } from '../questions/mustQuestions.ts';
import { getAdditionalQuestionsForBranch } from '../questions/branching.ts';
import { evaluate } from '../rules/index.ts';

export interface FlowState {
  currentStage: 'wizard' | 'outputs' | 'negotiation_card';
  currentStepIndex: number;
  answers: BorrowerAnswers;
  outputs: FourOutputs | null;
  activePersonaId?: 'priya' | 'ravi' | 'anita' | null;
}

export type FlowAction =
  | { type: 'SET_ANSWER'; field: keyof BorrowerAnswers; value: unknown }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SKIP_STEP' }
  | { type: 'GO_TO_STAGE'; stage: FlowState['currentStage'] }
  | { type: 'LOAD_PERSONA'; personaId: 'priya' | 'ravi' | 'anita' }
  | { type: 'RESET' };

export const INITIAL_ANSWERS: BorrowerAnswers = {
  purpose: 'consumption_other',
  amountWanted: 500000,
  loanTypeWanted: 'personal_loan',
  monthlyIncome: 50000,
  employmentType: 'salaried',
  existingEmis: 0,
  householdExpenses: 20000,
  age: 30,
  creditScoreKnown: false,
  creditScore: null,
};

export const PERSONA_PRESETS: Record<'priya' | 'ravi' | 'anita', BorrowerAnswers> = {
  priya: {
    purpose: 'wedding',
    amountWanted: 800000,
    loanTypeWanted: 'personal_loan',
    monthlyIncome: 110000,
    employmentType: 'salaried',
    existingEmis: 14000,
    householdExpenses: 25000,
    rentExpense: 28000,
    age: 29,
    creditScoreKnown: true,
    creditScore: 780,
    tenureYearsInWork: 5,
    emergencySavingsMonths: 4,
    hasRecentBounces: false,
  },
  ravi: {
    purpose: 'business_expansion',
    amountWanted: 1500000,
    loanTypeWanted: 'msme_business',
    monthlyIncome: 60000,
    coApplicantIncome: 18000,
    employmentType: 'self_employed',
    existingEmis: 0,
    householdExpenses: 28000,
    age: 42,
    creditScoreKnown: false,
    creditScore: null,
    tenureYearsInWork: 14,
    itrAnnualIncome: 420000,
    collateralType: 'property',
    collateralValue: 4500000,
    productiveLoan: true,
    expectedMonthlyRevenueBoost: 20000,
  },
  anita: {
    purpose: 'vehicle',
    amountWanted: 150000,
    loanTypeWanted: 'two_wheeler',
    monthlyIncome: 28000,
    employmentType: 'informal',
    existingEmis: 4500,
    householdExpenses: 20000,
    age: 35,
    creditScoreKnown: false,
    creditScore: null,
    variableIncomePercent: 60,
    hasRecentBounces: true,
    bouncesCount: 1,
    hasExistingHighCostDebt: true,
    highCostDebtAmount: 35000,
    highCostDebtRate: 32,
    productiveLoan: true,
    expectedMonthlyRevenueBoost: 8000,
  },
};

export function getActiveQuestionsList(answers: BorrowerAnswers): QuestionDefinition[] {
  const branchQuestions = getAdditionalQuestionsForBranch(answers.employmentType);
  return [...MUST_QUESTIONS, ...branchQuestions];
}

export function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case 'SET_ANSWER': {
      const updatedAnswers = { ...state.answers, [action.field]: action.value };

      // Map special values (e.g. credit score -1 means unknown)
      if (action.field === 'creditScore') {
        if (action.value === -1 || action.value === null) {
          updatedAnswers.creditScoreKnown = false;
          updatedAnswers.creditScore = null;
        } else {
          updatedAnswers.creditScoreKnown = true;
          updatedAnswers.creditScore = Number(action.value);
        }
      }

      // Auto-update loanTypeWanted based on purpose if not explicitly picked
      if (action.field === 'purpose') {
        if (action.value === 'vehicle') updatedAnswers.loanTypeWanted = 'two_wheeler';
        else if (action.value === 'business_expansion') updatedAnswers.loanTypeWanted = 'msme_business';
        else updatedAnswers.loanTypeWanted = 'personal_loan';
      }

      // If collateral value is entered > 0, default collateralType to property if unset
      if (action.field === 'collateralValue' && Number(action.value) > 0 && !updatedAnswers.collateralType) {
        updatedAnswers.collateralType = 'property';
      }

      // If highCostDebtAmount > 0, set hasExistingHighCostDebt and default rate to 30%
      if (action.field === 'highCostDebtAmount' && Number(action.value) > 0) {
        updatedAnswers.hasExistingHighCostDebt = true;
        if (!updatedAnswers.highCostDebtRate) updatedAnswers.highCostDebtRate = 32;
      }

      const newOutputs = evaluate(updatedAnswers);
      return {
        ...state,
        answers: updatedAnswers,
        outputs: newOutputs,
        activePersonaId: null, // Clear preset indicator on manual edits
      };
    }

    case 'NEXT_STEP': {
      const questions = getActiveQuestionsList(state.answers);
      if (state.currentStepIndex + 1 < questions.length) {
        return {
          ...state,
          currentStepIndex: state.currentStepIndex + 1,
        };
      }
      return {
        ...state,
        currentStage: 'outputs',
      };
    }

    case 'PREV_STEP': {
      if (state.currentStepIndex > 0) {
        return {
          ...state,
          currentStepIndex: state.currentStepIndex - 1,
        };
      }
      return state;
    }

    case 'SKIP_STEP': {
      const questions = getActiveQuestionsList(state.answers);
      if (state.currentStepIndex + 1 < questions.length) {
        return {
          ...state,
          currentStepIndex: state.currentStepIndex + 1,
        };
      }
      return {
        ...state,
        currentStage: 'outputs',
      };
    }

    case 'GO_TO_STAGE': {
      return {
        ...state,
        currentStage: action.stage,
      };
    }

    case 'LOAD_PERSONA': {
      const preset = PERSONA_PRESETS[action.personaId];
      const evaluated = evaluate(preset);
      return {
        ...state,
        answers: { ...preset },
        outputs: evaluated,
        currentStage: 'outputs',
        currentStepIndex: 0,
        activePersonaId: action.personaId,
      };
    }

    case 'RESET': {
      const defaultAnswers = { ...INITIAL_ANSWERS };
      return {
        currentStage: 'wizard',
        currentStepIndex: 0,
        answers: defaultAnswers,
        outputs: evaluate(defaultAnswers),
        activePersonaId: null,
      };
    }

    default:
      return state;
  }
}
