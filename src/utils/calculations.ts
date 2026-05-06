import type { UserInput } from '../types';

/**
 * IMC = peso / altura²
 */
export function calculateIMC({ weight, height }: UserInput): number {
  if (!weight || !height) return 0;
  return weight / (height * height);
}

/**
 * TMB (Mifflin-St Jeor)
 */
export function calculateBMR(data: UserInput): number {
  const { weight, height, age, gender } = data;

  if (!weight || !height || !age) return 0;

  const heightCm = height * 100;

  if (gender === 'male') {
    return 10 * weight + 6.25 * heightCm - 5 * age + 5;
  }

  return 10 * weight + 6.25 * heightCm - 5 * age - 161;
}

/**
 * TDEE = TMB × fator de atividade
 */
export function calculateTDEE(data: UserInput, bmr: number): number {
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
 * % Gordura (estimativa)
 */
export function calculateBodyFat(data: UserInput): number {
  const { age, gender } = data;

  const imc = calculateIMC(data);

  if (!imc || !age) return 0;

  if (gender === 'male') {
    return 1.2 * imc + 0.23 * age - 16.2;
  }

  return 1.2 * imc + 0.23 * age - 5.4;
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
export function calculateFFMI(leanMass: number, height: number): number {
  if (!leanMass || !height) return 0;

  return leanMass / (height * height);
}
