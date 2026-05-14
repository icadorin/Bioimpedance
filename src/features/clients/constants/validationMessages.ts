export const CLIENT_EMPTY_MESSAGES = {
  name: 'Nome é obrigatório',
  email: 'Email é obrigatório',
  gender: 'Selecione um sexo válido',
  birthDate: 'Data de nascimento é obrigatória',
} as const;

export const CLIENT_INVALID_MESSAGES = {
  name_short: 'Nome deve ter pelo menos 3 caracteres',
  name_long: 'Nome deve ter no máximo 100 caracteres',
  name_chars: 'Nome deve conter apenas letras e espaços',
  email_invalid: 'Email inválido',
  phone_invalid: 'Telefone deve ter entre 10 e 15 dígitos',
  gender_invalid: 'Selecione um sexo válido',
  birthDate_format: 'Data de nascimento inválida',
  birthDate_invalid: 'Data de nascimento inválida',
  birthDate_age: 'Idade deve estar entre 10 e 120 anos',
  notes_long: 'Observações deve ter no máximo 500 caracteres',
} as const;
