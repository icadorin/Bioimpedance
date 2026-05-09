import type { UserInput } from '../types';
import type { BioimpedanceInput } from '../types/bioimpedance.types';
import type { SkinfoldInput } from '../types/skinfold.types';

export const navyNumericKeys: (keyof UserInput)[] = [
  'weight',
  'height',
  'age',
  'waist',
  'neck',
  'hip',
];

export const navyDecimalKeys: (keyof UserInput)[] = ['weight', 'height', 'waist', 'neck', 'hip'];

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
