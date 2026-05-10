import type { BioimpedanceInput } from '../types/bioimpedance.types';

/**
 * % Gordura via bioimpedância (fórmula de Segal et al.)
 */
export function calculateBodyFatBio(data: BioimpedanceInput): number {
  const { weight, height, age, gender, resistance, reactance } = data;

  if (!weight || !height || !age || !resistance || !reactance) return 0;

  const heightCm = height;

  let leanMass = 0;

  if (gender === 'male') {
    leanMass =
      0.0006636 * heightCm ** 2 - 0.02117 * resistance + 0.62854 * weight - 0.1238 * age + 9.33285;
  } else {
    leanMass =
      0.0011285 * heightCm ** 2 -
      0.01273 * resistance +
      0.16796 * weight -
      0.14941 * age +
      14.59593;
  }

  if (leanMass <= 0 || leanMass >= weight) return 0;

  const fatMass = weight - leanMass;
  const bodyFat = (fatMass / weight) * 100;

  return isFinite(bodyFat) && bodyFat > 0 ? bodyFat : 0;
}

export function calculateBioImpedance(data: BioimpedanceInput): number {
  const { resistance, reactance } = data;

  if (!resistance || !reactance) return 0;

  return Math.sqrt(resistance ** 2 + reactance ** 2);
}

export function calculatePhaseAngle(data: BioimpedanceInput): number {
  const { resistance, reactance } = data;

  if (!resistance || !reactance) return 0;

  return Math.atan(reactance / resistance) * (180 / Math.PI);
}

export function calculateTBW(data: BioimpedanceInput): number {
  const { weight, height, gender, resistance } = data;

  if (!weight || !height || !resistance) return 0;

  const heightCm = height;

  const tbw =
    gender === 'male'
      ? 0.59 * (heightCm ** 2 / resistance) + 0.065 * weight + 0.04
      : 0.47 * (heightCm ** 2 / resistance) + 0.113 * weight - 4.03;

  return isFinite(tbw) && tbw > 0 ? tbw : 0;
}
