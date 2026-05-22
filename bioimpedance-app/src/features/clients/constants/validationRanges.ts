export const CLIENT_VALIDATION_RULES = {
  name: { min: 3, max: 100 },
  age: { min: 10, max: 120 },
  notes: { max: 500 },
  phone: { minDigits: 10, maxDigits: 15 },
} as const;

export const VALID_GENDERS = ['male', 'female'] as const;
export const VALID_GOALS = [
  'emagrecimento',
  'hipertrofia',
  'condicionamento',
  'performance',
  'recomposicao',
] as const;

export type ValidGender = (typeof VALID_GENDERS)[number];
export type ValidGoal = (typeof VALID_GOALS)[number];
