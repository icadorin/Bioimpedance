import type { AssessmentMethod } from '../types/assessment.types';
import type { MethodDetails } from '../types/result.types';

export const DEFAULT_METHOD_DETAILS: Record<AssessmentMethod, MethodDetails> = {
  navy: {
    title: 'Detalhes do método',
    items: [
      {
        label: 'Método',
        value: '--',
        description: 'Método utilizado para estimar gordura corporal',
      },
      {
        label: 'Medida base',
        value: '--',
        description: 'Valor principal usado no cálculo',
      },
      {
        label: 'Medidas usadas',
        value: '--',
        description: 'Circunferências utilizadas na fórmula',
      },
    ],
  },

  bioimpedance: {
    title: 'Detalhes da bioimpedância',
    items: [
      {
        label: 'Impedância',
        value: '--',
        description: 'Resistência elétrica corporal',
      },
      {
        label: 'Ângulo de fase',
        value: '--',
        description: 'Indicador relacionado à integridade celular',
      },
      {
        label: 'Água corporal',
        value: '--',
        description: 'Estimativa de água total no corpo',
      },
    ],
  },

  skinfold: {
    title: 'Detalhes das dobras',
    items: [
      {
        label: 'Protocolo',
        value: '--',
        description: 'Método de avaliação utilizado',
      },
      {
        label: 'Soma das dobras',
        value: '--',
        description: 'Soma das medidas das dobras cutâneas',
      },
      {
        label: 'Densidade corporal',
        value: '--',
        description: 'Estimativa da densidade corporal',
      },
    ],
  },

  imc: {
    title: 'Detalhes do IMC',
    items: [
      {
        label: 'Classificação',
        value: '--',
        description: 'Faixa do IMC calculado',
      },
      {
        label: 'Faixa saudável',
        value: '--',
        description: 'Intervalo considerado saudável',
      },
    ],
  },
};
