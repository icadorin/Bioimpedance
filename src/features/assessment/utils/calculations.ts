import type { NavyAssessmentInput } from '../types/assessment-input.types';

/**
 * IMC = peso / altura²
 */
export function calculateIMC({ weight, height }: NavyAssessmentInput): number {
  if (!weight || !height) return 0;

  const h = height / 100; // cm → m
  return weight / (h * h);
}

/**
 * TMB (Mifflin-St Jeor)
 */
export function calculateBMR(data: NavyAssessmentInput): number {
  const { weight, height, age, gender } = data;

  if (!weight || !height || !age) return 0;

  const heightCm = height;

  if (gender === 'male') {
    return 10 * weight + 6.25 * heightCm - 5 * age + 5;
  }

  return 10 * weight + 6.25 * heightCm - 5 * age - 161;
}

/**
 * TDEE = TMB × fator de atividade
 */
export function calculateTDEE(data: NavyAssessmentInput, bmr: number): number {
  const activityMap = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const factor = activityMap[data.activityLevel] ?? 1.2;

  return bmr * factor;
}

/**
 * % Gordura (estimativa) - Navy Method
 */
export function calculateBodyFat(data: NavyAssessmentInput): number {
  const { gender, waist, neck, hip, height } = data;

  if (!waist || !neck || !height) return 0;

  const heightCm = height;

  if (heightCm < 120 || waist < 60 || neck < 25) return 0;

  if (gender === 'male') {
    const diff = waist - neck;
    if (diff < 10) return 0;

    const value = 86.01 * Math.log10(diff) - 70.041 * Math.log10(heightCm) + 36.76;
    return isFinite(value) && value > 0 ? value : 0;
  }

  // Feminino precisa do quadril
  if (!hip) return 0;

  const value = 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(heightCm) - 78.387;

  return isFinite(value) && value > 0 ? value : 0;
}

/**
 * Massa magra = peso × (1 - % gordura)
 */
export function calculateLeanMass(weight: number, bodyFat: number): number {
  if (!weight || !bodyFat) return 0;
  return weight * (1 - bodyFat / 100);
}

/**
 * Massa gorda = peso × (% gordura)
 */
export function calculateFatMass(weight: number, bodyFat: number): number {
  if (!weight || !bodyFat) return 0;
  return weight * (bodyFat / 100);
}

/**
 * FFMI = massa magra / altura²
 */
export function calculateFFMI(leanMass: number, heightCm: number): number {
  if (!leanMass || !heightCm) return 0;

  const heightM = heightCm / 100;
  return leanMass / (heightM * heightM);
}
