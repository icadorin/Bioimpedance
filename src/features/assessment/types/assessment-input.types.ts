export type Gender = 'male' | 'female' | '';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export type Objective = 'cutting' | 'maintenance' | 'bulking';

export interface BaseAssessmentInput {
  weight: number;
  height: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  objective: Objective;
}

export interface NavyAssessmentInput extends BaseAssessmentInput {
  waist: number;
  neck: number;
  hip: number;
}
