export interface PhysicResult {
  imc: number;
  bmr: number;
  tdee: number;
  bodyFat: number;
  leanMass: number;
  fatMass: number;
  ffmi: number;
  bodyFatLevel: string;
}

export interface RecommendationResult {
  targetCalories: number;
  protein: number;
  cardio: string;
  trainingType: string;
  notes: string[];
}
