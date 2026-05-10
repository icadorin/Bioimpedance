export interface MethodDetailItem {
  label: string;
  value: string;
  description?: string;
}

export interface MethodDetails {
  title: string;
  items: MethodDetailItem[];
}

export interface PhysicResult {
  imc: number;
  bmr: number;
  tdee: number;
  bodyFat: number;
  leanMass: number;
  fatMass: number;
  ffmi: number;
  bodyFatLevel: string;
  methodDetails?: MethodDetails;
}

export interface RecommendationResult {
  targetCalories: number;
  protein: number;
  cardio: string;
  trainingType: string;
  notes: string[];
}
