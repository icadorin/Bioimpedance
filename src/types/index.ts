export type Gender = 'male' | 'female';
// sexo biológico

export type ActivityLevel =
  | 'sedentary' // sedentário (quase não treina)
  | 'light' // leve (1–3x por semana)
  | 'moderate' // moderado (3–5x por semana)
  | 'active' // ativo (6–7x por semana)
  | 'very_active'; // muito ativo (treino pesado / físico intenso)

export type Objective =
  | 'cutting' // perder gordura
  | 'maintenance' // manter peso atual
  | 'bulking'; // ganhar massa

export interface UserInput {
  weight: number; // peso em kg
  height: number; // altura em metros (ex: 1.75)
  age: number; // idade

  gender: Gender;

  activityLevel: ActivityLevel; // nível de atividade física
  objective: Objective; // objetivo físico

  waist?: number; // cintura em cm (ex: 80)
  neck?: number; // pescoço em cm
  hip?: number; // quadril em cm (usado principalmente para mulheres)
}
