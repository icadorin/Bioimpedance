import type { Gender, ActivityLevel, Objective } from './index';

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

export interface SkinfoldInput {
  weight: number;
  height: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  objective: Objective;
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
