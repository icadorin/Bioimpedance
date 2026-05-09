import type { UserInput } from '../types';

export const EMPTY_MESSAGES: Partial<Record<keyof UserInput, string>> = {
  weight: 'Informe seu peso',
  height: 'Informe sua altura',
  age: 'Informe sua idade',
  waist: 'Informe a medida da cintura',
  neck: 'Informe a medida do pescoço',
  hip: 'Informe a medida do quadril',
};

export const INVALID_MESSAGES: Partial<Record<keyof UserInput, string>> = {
  weight: 'Peso deve ser entre 20 e 300 kg',
  height: 'Altura deve ser entre 50 e 250 cm',
  age: 'Idade deve ser entre 10 e 100 anos',
  waist: 'Cintura deve ser entre 50 e 200 cm',
  neck: 'Pescoço deve ser entre 20 e 60 cm',
  hip: 'Quadril deve ser entre 50 e 200 cm',
};
