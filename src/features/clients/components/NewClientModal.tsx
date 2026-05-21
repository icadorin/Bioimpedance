import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { InputField } from '../../../components/shared/InputField';
import { genderOptions } from '../../assessment/config/selectOptions';
import type { Client } from '../types';
import {
  validateClientField,
  validateClientForm,
  type ClientFormData,
} from '../utils/clientValidation';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Promise<unknown> | unknown;
}

const goalOptions = [
  { value: '', label: 'Selecione um objetivo' },
  { value: 'emagrecimento', label: 'Emagrecimento' },
  { value: 'hipertrofia', label: 'Hipertrofia' },
  { value: 'condicionamento', label: 'Condicionamento' },
  { value: 'performance', label: 'Performance' },
  { value: 'recomposicao', label: 'Recomposição corporal' },
];

const validateField = (name: string, value: string): string | undefined => {
  const error = validateClientField(name, value);
  return error || undefined;
};

export default function NewClientModal({ isOpen, onClose, onSave }: NewClientModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    birthDate: '',
    goal: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        gender: '',
        birthDate: '',
        goal: '',
        notes: '',
      });
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const isSelect = e.target.tagName === 'SELECT';

    if (isSelect) {
      // select: revalida se já tem erro visível (independente de touched)
      if (errors[name]) {
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error || '' }));
      }
    } else {
      // input: revalida se já tocado
      if (touched[name]) {
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error || '' }));
      }
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error || '' }));
  };

  const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData((prev) => ({ ...prev, phone: formatted }));

    if (touched.phone) {
      const error = validateField('phone', formatted);
      setErrors((prev) => ({ ...prev, phone: error || '' }));
    }
  };

  const formatBirthDate = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  };

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBirthDate(e.target.value);
    setFormData((prev) => ({ ...prev, birthDate: formatted }));

    if (touched.birthDate) {
      const error = validateField('birthDate', formatted);
      setErrors((prev) => ({ ...prev, birthDate: error || '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errs = validateClientForm(formData as ClientFormData);

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // marca todos os campos com erro como touched
      const newTouched = Object.keys(errs).reduce(
        (acc, k) => ({ ...acc, [k]: true }),
        {} as Record<string, boolean>
      );
      setTouched((prev) => ({ ...prev, ...newTouched }));
      return;
    }

    const [day, month, year] = formData.birthDate.split('/');
    setIsSubmitting(true);

    try {
      await onSave({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone || undefined,
        gender: formData.gender as 'male' | 'female',
        birthDate: `${year}-${month}-${day}`,
        goal: formData.goal || undefined,
        notes: formData.notes || undefined,
        status: 'active',
      });
      onClose();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Erro ao salvar cliente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  function handleClose() {
    setErrors({});
    setTouched({});
    onClose();
  }

  return (
    <>
      <div className="modal-overlay" onClick={handleClose} />
      <div className="modal-container">
        <div className="modal-header">
          <h2>Novo Cliente</h2>
          <button type="button" className="modal-close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <InputField
                label="Nome *"
                name="name"
                value={formData.name}
                error={errors.name}
                placeholder="Ex: João Silva"
                onChange={handleChange}
                onBlur={handleBlur}
              />

              <InputField
                label="Email *"
                name="email"
                value={formData.email}
                error={errors.email}
                placeholder="joao@email.com"
                onChange={handleChange}
                onBlur={handleBlur}
              />

              <InputField
                label="Telefone"
                name="phone"
                value={formData.phone}
                error={errors.phone}
                placeholder="(47) 99999-9999"
                inputMode="tel"
                maxLength={15}
                onChange={handlePhoneChange}
                onBlur={handleBlur}
              />

              <InputField
                type="select"
                label="Sexo *"
                name="gender"
                value={formData.gender}
                error={errors.gender}
                options={genderOptions}
                onChange={handleChange}
                onBlur={handleBlur}
              />

              <InputField
                label="Data de Nascimento *"
                name="birthDate"
                value={formData.birthDate}
                error={errors.birthDate}
                placeholder="DD/MM/AAAA"
                inputMode="numeric"
                maxLength={10}
                onChange={handleBirthDateChange}
                onBlur={handleBlur}
              />

              <InputField
                type="select"
                label="Objetivo"
                name="goal"
                value={formData.goal}
                options={goalOptions}
                onChange={handleChange}
                onBlur={handleBlur}
              />

              <div className="full-width">
                <label className="field-label">Observações</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Observações sobre o cliente (opcional)"
                  rows={3}
                  maxLength={500}
                />
                <small>{formData.notes.length}/500</small>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={handleClose}>
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
