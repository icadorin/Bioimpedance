import type { BioimpedanceInput } from '../types/bioimpedance.types';
import type { SkinfoldInput } from '../types/skinfold.types';

export type RangeRule = {
  min: number;
  max: number;
  emptyMessage: string;
  invalidMessage: string;
};

export const BIO_RANGE_RULES: Partial<Record<keyof BioimpedanceInput, RangeRule>> = {
  weight: {
    min: 20,
    max: 300,
    emptyMessage: 'Informe seu peso',
    invalidMessage: 'Peso deve ser entre 20 e 300 kg',
  },

  height: {
    min: 50,
    max: 250,
    emptyMessage: 'Informe sua altura',
    invalidMessage: 'Altura deve ser entre 50 e 250 cm',
  },

  age: {
    min: 10,
    max: 100,
    emptyMessage: 'Informe sua idade',
    invalidMessage: 'Idade deve ser entre 10 e 100 anos',
  },

  resistance: {
    min: 100,
    max: 1500,
    emptyMessage: 'Informe a resistência',
    invalidMessage: 'Resistência deve ser entre 100 e 1500 ohms',
  },

  reactance: {
    min: 5,
    max: 300,
    emptyMessage: 'Informe a reactância',
    invalidMessage: 'Reactância deve ser entre 5 e 300 ohms',
  },
};

export const SKINFOLD_RANGE_RULES: Partial<Record<keyof SkinfoldInput, RangeRule>> = {
  weight: {
    min: 20,
    max: 300,
    emptyMessage: 'Informe seu peso',
    invalidMessage: 'Peso deve ser entre 20 e 300 kg',
  },

  height: {
    min: 50,
    max: 250,
    emptyMessage: 'Informe sua altura',
    invalidMessage: 'Altura deve ser entre 50 e 250 cm',
  },

  age: {
    min: 10,
    max: 100,
    emptyMessage: 'Informe sua idade',
    invalidMessage: 'Idade deve ser entre 10 e 100 anos',
  },

  biceps: {
    min: 1,
    max: 100,
    emptyMessage: 'Informe a dobra do bíceps',
    invalidMessage: 'Bíceps deve ser entre 1 e 100 mm',
  },

  chest: {
    min: 1,
    max: 100,
    emptyMessage: 'Informe a dobra peitoral',
    invalidMessage: 'Peitoral deve ser entre 1 e 100 mm',
  },

  midaxillary: {
    min: 1,
    max: 100,
    emptyMessage: 'Informe a dobra axilar média',
    invalidMessage: 'Axilar média deve ser entre 1 e 100 mm',
  },

  triceps: {
    min: 1,
    max: 100,
    emptyMessage: 'Informe a dobra do tríceps',
    invalidMessage: 'Tríceps deve ser entre 1 e 100 mm',
  },

  subscapular: {
    min: 1,
    max: 100,
    emptyMessage: 'Informe a dobra subescapular',
    invalidMessage: 'Subescapular deve ser entre 1 e 100 mm',
  },

  abdominal: {
    min: 1,
    max: 100,
    emptyMessage: 'Informe a dobra abdominal',
    invalidMessage: 'Abdominal deve ser entre 1 e 100 mm',
  },

  suprailiac: {
    min: 1,
    max: 100,
    emptyMessage: 'Informe a dobra supra-ilíaca',
    invalidMessage: 'Supra-ilíaca deve ser entre 1 e 100 mm',
  },

  thigh: {
    min: 1,
    max: 100,
    emptyMessage: 'Informe a dobra da coxa',
    invalidMessage: 'Coxa deve ser entre 1 e 100 mm',
  },
};
