import type { UserInput } from '../types';

/**
 * 📊 Classificação de % gordura (homem)
 */
function classifyBodyFatMale(bodyFat: number) {
  if (bodyFat < 10) return 'Muito baixo';
  if (bodyFat < 15) return 'Atleta';
  if (bodyFat < 20) return 'Normal';
  if (bodyFat < 25) return 'Alto';
  return 'Muito alto';
}

/**
 * 📊 Classificação de % gordura (mulher)
 */
function classifyBodyFatFemale(bodyFat: number) {
  if (bodyFat < 18) return 'Muito baixo';
  if (bodyFat < 23) return 'Atleta';
  if (bodyFat < 30) return 'Normal';
  if (bodyFat < 35) return 'Alto';
  return 'Muito alto';
}

/**
 * 🧠 Interpretação principal
 */
export function interpretBodyFat(data: UserInput, bodyFat: number) {
  if (!bodyFat) return 'Sem dados';

  if (data.gender === 'male') {
    return classifyBodyFatMale(bodyFat);
  }

  return classifyBodyFatFemale(bodyFat);
}
