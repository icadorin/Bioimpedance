import type { UserInput } from '../types';

/**
 * Motor de recomendação automática
 * Converte dados físicos em plano básico de dieta e treino
 */
export function generateRecommendation(data: UserInput, tdee: number, bodyFat: number) {
  const { objective, weight, gender } = data;

  let calories = tdee;
  let protein = weight * 2; // base padrão (g/kg)

  let trainingType = '';
  let cardio = '';
  const notes: string[] = [];

  /**
   * 🥗 DIETA BASEADA NO OBJETIVO
   */
  if (objective === 'cutting') {
    calories = tdee * 0.85; // déficit calórico leve
    protein = weight * 2.2; // mais proteína para preservar massa magra
    notes.push('Déficit calórico para perda de gordura');
  }

  if (objective === 'bulking') {
    calories = tdee * 1.1; // superávit leve
    protein = weight * 1.8;
    notes.push('Superávit calórico para ganho de massa');
  }

  if (objective === 'maintenance') {
    calories = tdee;
    protein = weight * 1.6;
    notes.push('Manutenção calórica');
  }

  /**
   * 🏋️ TREINO BASEADO NO % DE GORDURA
   */
  if (bodyFat > 25) {
    trainingType = 'Treino metabólico + força leve';
    cardio = '3–5x por semana (moderado)';
    notes.push('Foco em redução de gordura corporal');
  } else if (bodyFat > 18) {
    trainingType = 'Hipertrofia padrão';
    cardio = '2–3x por semana leve';
  } else {
    trainingType = 'Hipertrofia + performance';
    cardio = 'cardio leve opcional';
    notes.push('Foco em ganho de massa magra');
  }

  /**
   * ⚠️ ALERTAS INTELIGENTES
   */
  if (bodyFat > 30) {
    notes.push('Percentual de gordura elevado');
  }

  if (bodyFat < 8 && gender === 'male') {
    notes.push('Gordura muito baixa — atenção hormonal');
  }

  return {
    calories: Math.round(calories),
    protein: Math.round(protein),
    trainingType,
    cardio,
    notes,
  };
}
