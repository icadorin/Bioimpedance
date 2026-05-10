import type { NavyAssessmentInput, BioimpedanceInput, SkinfoldInput } from '../types';

export const navyNumericKeys: (keyof NavyAssessmentInput)[] = [
  'weight',
  'height',
  'age',
  'waist',
  'neck',
  'hip',
];

export const navyDecimalKeys: (keyof NavyAssessmentInput)[] = [
  'weight',
  'height',
  'waist',
  'neck',
  'hip',
];

export const bioNumericKeys: (keyof BioimpedanceInput)[] = [
  'weight',
  'height',
  'age',
  'resistance',
  'reactance',
];

export const bioDecimalKeys: (keyof BioimpedanceInput)[] = [
  'weight',
  'height',
  'resistance',
  'reactance',
];

export const skinfoldNumericKeys: (keyof SkinfoldInput)[] = [
  'weight',
  'height',
  'age',
  'biceps',
  'chest',
  'midaxillary',
  'triceps',
  'subscapular',
  'abdominal',
  'suprailiac',
  'thigh',
];

export const skinfoldDecimalKeys: (keyof SkinfoldInput)[] = [
  'weight',
  'height',
  'biceps',
  'chest',
  'midaxillary',
  'triceps',
  'subscapular',
  'abdominal',
  'suprailiac',
  'thigh',
];
