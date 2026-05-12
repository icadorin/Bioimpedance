export type AssessmentMethod = 'navy' | 'bioimpedance' | 'skinfold' | 'imc';

export interface AssessmentResult {
  imc: number;
  bodyFat: number;
  leanMass: number;
  fatMass: number;
  ffmi?: number;
  bmr: number;
  tdee: number;
  targetCalories?: number;
  bodyFatLevel: string;
}

export interface Assessment {
  id: string;
  clientId?: string; // undefined = avaliação avulsa
  date: string; // YYYY-MM-DD
  method: AssessmentMethod;

  // Dados básicos
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';

  // Dados específicos
  navy?: {
    waist: number;
    neck: number;
    hip?: number;
  };

  bioimpedance?: {
    resistance: number;
    reactance: number;
  };

  skinfold?: {
    protocol: 'jp3' | 'jp7' | 'dw4';
    biceps?: number;
    chest?: number;
    midaxillary?: number;
    triceps?: number;
    subscapular?: number;
    abdominal?: number;
    suprailiac?: number;
    thigh?: number;
  };

  results: AssessmentResult;
  observations?: string;

  createdAt: string;
  updatedAt: string;
}
