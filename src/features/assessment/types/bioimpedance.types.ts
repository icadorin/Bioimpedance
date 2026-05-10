import type { BaseAssessmentInput } from './assessment-input.types.ts';

export interface BioimpedanceInput extends BaseAssessmentInput {
  resistance: number;
  reactance: number;
}

export type BioimpedanceInputValues = Record<
  'weight' | 'height' | 'age' | 'resistance' | 'reactance',
  string
>;
