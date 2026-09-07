/**
 * branching.ts
 * 
 * Maps the borrower's employment type to their relevant additional questions.
 * Guarantees adaptive routing: A salaried IT engineer and a kirana owner never
 * see the same question set.
 */

import { EmploymentType } from '../types/borrower.ts';
import { QuestionDefinition } from './mustQuestions.ts';
import {
  SALARIED_ADDITIONAL_QUESTIONS,
  SELF_EMPLOYED_ADDITIONAL_QUESTIONS,
  INFORMAL_ADDITIONAL_QUESTIONS,
} from './additionalQuestions.ts';

export function getAdditionalQuestionsForBranch(
  employmentType: EmploymentType
): QuestionDefinition[] {
  switch (employmentType) {
    case 'salaried':
      return SALARIED_ADDITIONAL_QUESTIONS;
    case 'self_employed':
      return SELF_EMPLOYED_ADDITIONAL_QUESTIONS;
    case 'informal':
      return INFORMAL_ADDITIONAL_QUESTIONS;
    default:
      return [];
  }
}
