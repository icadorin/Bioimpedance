import type { BaseAssessmentInput } from './assessment-input.types.ts';

export type SkinfoldProtocol = 'jp3' | 'jp7' | 'dw4';

export type SkinfoldMeasurementKey =
  | 'biceps'
  | 'chest'
  | 'midaxillary'
  | 'triceps'
  | 'subscapular'
  | 'abdominal'
  | 'suprailiac'
  | 'thigh';

export interface SkinfoldInput extends BaseAssessmentInput {
  protocol: SkinfoldProtocol;

  biceps: number;
  chest: number;
  midaxillary: number;
  triceps: number;
  subscapular: number;
  abdominal: number;
  suprailiac: number;
  thigh: number;
}

export type SkinfoldInputValues = Record<
  'weight' | 'height' | 'age' | SkinfoldMeasurementKey,
  string
>;
