import { useState, useEffect } from 'react';
import type { Assessment } from '../types/assessment.types';
import type { BaseAssessmentInput } from '../types/assessment-input.types';

const STORAGE_KEY = 'assessment-state-v2';

type PersistedState = {
  commonData: BaseAssessmentInput;
  commonInputValues: CommonInputValues;
  assessmentNotes: string;
};

type CommonInputValues = {
  weight: string;
  height: string;
  age: string;
};

const INITIAL_COMMON: BaseAssessmentInput = {
  weight: 0,
  height: 0,
  age: 0,
  gender: 'male',
  activityLevel: 'sedentary',
  objective: 'maintenance',
};

const INITIAL_COMMON_INPUT: CommonInputValues = {
  weight: '',
  height: '',
  age: '',
};

function loadFromStorage(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PersistedState) : null;
  } catch {
    return null;
  }
}

function parseDecimal(value: string): number {
  const v = value.replace(',', '.');
  return v === '' || v === '.' ? 0 : Number(v);
}

export function useAssessmentState() {
  const saved = loadFromStorage();

  // Mantém apenas os estados realmente necessários
  const [commonData, setCommonData] = useState<BaseAssessmentInput>(
    saved?.commonData ?? INITIAL_COMMON
  );
  const [commonInputValues, setCommonInputValues] = useState<CommonInputValues>(
    saved?.commonInputValues ?? INITIAL_COMMON_INPUT
  );
  const [assessmentNotes, setAssessmentNotes] = useState<string>(saved?.assessmentNotes ?? '');

  // Persistência simplificada
  useEffect(() => {
    const state: PersistedState = {
      commonData,
      commonInputValues,
      assessmentNotes,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [commonData, commonInputValues, assessmentNotes]);

  // Handler comum
  function handleCommonChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;

    if (name === 'weight' || name === 'height') {
      const display = value.replace(',', '.');
      if (!/^\d*\.?\d*$/.test(display)) return;
      setCommonInputValues((prev) => ({ ...prev, [name]: value }));
      setCommonData((prev) => ({ ...prev, [name]: parseDecimal(value) }));
    } else if (name === 'age') {
      if (!/^\d*$/.test(value)) return;
      setCommonInputValues((prev) => ({ ...prev, age: value }));
      setCommonData((prev) => ({ ...prev, age: value === '' ? 0 : Number(value) }));
    } else {
      setCommonData((prev) => ({ ...prev, [name]: value }));
    }
  }

  // Carregar apenas dados básicos de uma avaliação existente
  function loadFromAssessment(assessment: Assessment) {
    const newCommonData = {
      weight: assessment.weight,
      height: assessment.height,
      age: assessment.age,
      gender: assessment.gender,
      activityLevel: 'moderate' as const,
      objective: 'maintenance' as const,
    };

    const newInputValues = {
      weight: String(assessment.weight),
      height: String(assessment.height),
      age: String(assessment.age),
    };

    setCommonData(newCommonData);
    setCommonInputValues(newInputValues);
    setAssessmentNotes(assessment.observations || '');
  }

  // Reset geral
  function resetAll() {
    setCommonData({ ...INITIAL_COMMON });
    setCommonInputValues({ ...INITIAL_COMMON_INPUT });
    localStorage.removeItem(STORAGE_KEY);
  }

  return {
    commonData,
    commonInputValues,
    setCommonInputValues,
    assessmentNotes,
    setAssessmentNotes,
    handleCommonChange,
    loadFromAssessment,
    resetAll,
    setCommonData,
  };
}
