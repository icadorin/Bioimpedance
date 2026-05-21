import { useState } from 'react';
import type { Assessment } from '../types/assessment.types';
import type { BaseAssessmentInput } from '../types/assessment-input.types';

type CommonInputValues = {
  weight: string;
  height: string;
  age: string;
};

const INITIAL_COMMON: BaseAssessmentInput = {
  weight: 0,
  height: 0,
  age: 0,
  gender: '',
  activityLevel: 'sedentary',
  objective: 'maintenance',
};

const INITIAL_COMMON_INPUT: CommonInputValues = {
  weight: '',
  height: '',
  age: '',
};

function parseDecimal(value: string): number {
  const normalized = value.replace(',', '.');
  return normalized === '' || normalized === '.' ? 0 : Number(normalized);
}

export function useAssessmentState() {
  const [commonData, setCommonData] = useState<BaseAssessmentInput>(INITIAL_COMMON);
  const [commonInputValues, setCommonInputValues] =
    useState<CommonInputValues>(INITIAL_COMMON_INPUT);
  const [assessmentNotes, setAssessmentNotes] = useState('');

  function handleCommonChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;

    if (name === 'weight' || name === 'height') {
      const display = value.replace(',', '.');
      if (!/^\d*\.?\d*$/.test(display)) return;
      setCommonInputValues((prev) => ({ ...prev, [name]: value }));
      setCommonData((prev) => ({ ...prev, [name]: parseDecimal(value) }));
      return;
    }

    if (name === 'age') {
      if (!/^\d*$/.test(value)) return;
      setCommonInputValues((prev) => ({ ...prev, age: value }));
      setCommonData((prev) => ({ ...prev, age: value === '' ? 0 : Number(value) }));
      return;
    }

    setCommonData((prev) => ({ ...prev, [name]: value }));
  }

  function loadFromAssessment(assessment: Assessment) {
    setCommonData({
      weight: assessment.weight,
      height: assessment.height,
      age: assessment.age,
      gender: assessment.gender,
      activityLevel: 'moderate',
      objective: 'maintenance',
    });

    setCommonInputValues({
      weight: String(assessment.weight),
      height: String(assessment.height),
      age: String(assessment.age),
    });

    setAssessmentNotes(assessment.observations || '');
  }

  function resetAll() {
    setCommonData({ ...INITIAL_COMMON });
    setCommonInputValues({ ...INITIAL_COMMON_INPUT });
    setAssessmentNotes('');
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
