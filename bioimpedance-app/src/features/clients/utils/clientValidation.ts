import { CLIENT_EMPTY_MESSAGES, CLIENT_INVALID_MESSAGES } from '../constants/validationMessages';
import { CLIENT_VALIDATION_RULES, VALID_GENDERS } from '../constants/validationRanges';

// ── helpers ────────────────────────────────────────────────────────────────

function parseBirthDate(val: string): Date | null {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(val)) return null;
  const [day, month, year] = val.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  const valid =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return valid ? date : null;
}

function calcAge(birth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// ── field validators ───────────────────────────────────────────────────────

export function validateClientName(value: string): string {
  if (!value.trim()) return CLIENT_EMPTY_MESSAGES.name;
  if (value.trim().length < CLIENT_VALIDATION_RULES.name.min)
    return CLIENT_INVALID_MESSAGES.name_short;
  if (value.trim().length > CLIENT_VALIDATION_RULES.name.max)
    return CLIENT_INVALID_MESSAGES.name_long;
  if (!/^[a-zA-ZÀ-ÿ\s']+$/.test(value)) return CLIENT_INVALID_MESSAGES.name_chars;
  return '';
}

export function validateClientEmail(value: string): string {
  if (!value.trim()) return CLIENT_EMPTY_MESSAGES.email;
  // RFC-5322 simplificado — cobre 99% dos casos reais
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return CLIENT_INVALID_MESSAGES.email_invalid;
  return '';
}

export function validateClientPhone(value: string): string {
  if (!value) return ''; // opcional
  const digits = value.replace(/\D/g, '');
  const { minDigits, maxDigits } = CLIENT_VALIDATION_RULES.phone;
  if (digits.length < minDigits || digits.length > maxDigits)
    return CLIENT_INVALID_MESSAGES.phone_invalid;
  return '';
}

export function validateClientGender(value: string): string {
  if (!value) return CLIENT_EMPTY_MESSAGES.gender;
  if (!VALID_GENDERS.includes(value as any)) return CLIENT_INVALID_MESSAGES.gender_invalid;
  return '';
}

export function validateClientBirthDate(value: string): string {
  if (!value) return CLIENT_EMPTY_MESSAGES.birthDate;
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return CLIENT_INVALID_MESSAGES.birthDate_format;

  const date = parseBirthDate(value);
  if (!date) return CLIENT_INVALID_MESSAGES.birthDate_invalid;

  const age = calcAge(date);
  const { min, max } = CLIENT_VALIDATION_RULES.age;
  if (age < min || age > max) return CLIENT_INVALID_MESSAGES.birthDate_age;

  return '';
}

export function validateClientNotes(value: string): string {
  if (value.length > CLIENT_VALIDATION_RULES.notes.max) return CLIENT_INVALID_MESSAGES.notes_long;
  return '';
}

// ── map de campo → função ─────────────────────────────────────────────────
// validateClientField('email', value) de forma genérica

const VALIDATORS: Record<string, (v: string) => string> = {
  name: validateClientName,
  email: validateClientEmail,
  phone: validateClientPhone,
  gender: validateClientGender,
  birthDate: validateClientBirthDate,
  notes: validateClientNotes,
};

export function validateClientField(field: string, value: string): string {
  return VALIDATORS[field]?.(value) ?? '';
}

// ── validação completa do formulário ──────────────────────────────────────

export type ClientFormData = {
  name: string;
  email: string;
  phone: string;
  gender: string;
  birthDate: string;
  goal: string;
  notes: string;
};

export function validateClientForm(data: ClientFormData): Record<string, string> {
  const errs: Record<string, string> = {};

  const fields = ['name', 'email', 'phone', 'gender', 'birthDate', 'notes'] as const;
  fields.forEach((field) => {
    const error = validateClientField(field, data[field]);
    if (error) errs[field] = error;
  });

  // goal é opcional — sem validação de conteúdo
  return errs;
}
