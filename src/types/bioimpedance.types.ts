import type { Gender, ActivityLevel, Objective } from './index';

export interface BioimpedanceInput {
  weight: number;
  height: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  objective: Objective;
  resistance: number;
  reactance: number;
}

export type BioimpedanceInputValues = Record<
  'weight' | 'height' | 'age' | 'resistance' | 'reactance',
  string
>;
