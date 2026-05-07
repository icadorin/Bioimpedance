import type { Gender } from '../types';

/**
 * Interpretação do % de gordura corporal
 */
export function interpretBodyFat(gender: Gender, bodyFat: number): string {
  if (bodyFat <= 0) return 'Sem dados';

  if (gender === 'male') {
    if (bodyFat < 10) return 'Muito baixo';
    if (bodyFat < 15) return 'Atleta';
    if (bodyFat < 20) return 'Normal';
    if (bodyFat < 25) return 'Alto';
    return 'Muito alto';
  }

  if (bodyFat < 18) return 'Muito baixo';
  if (bodyFat < 23) return 'Atleta';
  if (bodyFat < 30) return 'Normal';
  if (bodyFat < 35) return 'Alto';
  return 'Muito alto';
}
