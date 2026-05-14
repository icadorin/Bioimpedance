import type { AssessmentMethod } from '../types/assessment.types';

export const genderOptions = [
  { value: '', label: 'Selecione o sexo' },
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Feminino' },
];

export const activityOptions = [
  { value: 'sedentary', label: 'Sedentário' },
  { value: 'light', label: 'Leve' },
  { value: 'moderate', label: 'Moderado' },
  { value: 'active', label: 'Ativo' },
  { value: 'very_active', label: 'Muito ativo' },
];

export const objectiveOptions = [
  { value: 'maintenance', label: 'Manutenção' },
  { value: 'cutting', label: 'Cutting' },
  { value: 'bulking', label: 'Bulking' },
];

export const skinfoldProtocolOptions = [
  { value: 'jp3', label: 'Jackson-Pollock 3 dobras' },
  { value: 'jp7', label: 'Jackson-Pollock 7 dobras' },
  { value: 'dw4', label: 'Durnin-Womersley 4 dobras' },
];

export const methodOptions = [
  { value: 'navy', label: 'Navy' },
  { value: 'bioimpedance', label: 'Bioimpedância' },
  { value: 'skinfold', label: 'Dobras cutâneas' },
  { value: 'imc', label: 'IMC estimado' },
] satisfies { value: AssessmentMethod; label: string }[];
