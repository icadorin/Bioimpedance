import type { BaseAssessmentInput } from './assessment-input.types';

export interface BioimpedanceInput extends BaseAssessmentInput {
  resistance: number;
  reactance: number;
}
