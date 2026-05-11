import { useState, useEffect } from 'react';
import type { AssessmentMethod } from '../types/assessment.types';
import type { BaseAssessmentInput, NavyAssessmentInput } from '../types/assessment-input.types';
import type { BioimpedanceInput } from '../types/bioimpedance.types';
import type {
  SkinfoldInput,
  SkinfoldMeasurementKey,
  SkinfoldProtocol,
} from '../types/skinfold.types';
import type {
  CommonInputValues,
  NavySpecificInputValues,
  BioSpecificInputValues,
  SkinfoldSpecificInputValues,
  NavyInputValues,
  BioimpedanceInputValues,
  SkinfoldInputValues,
} from '../types/input-values.types';
import type { PhysicResult, RecommendationResult } from '../types/assessment-result.types';
import { getRequiredSkinfoldFields } from '../utils/calculationsSkin';
import { STORAGE_KEY } from '../config/storage';

type Result = PhysicResult & RecommendationResult;

type NavySpecificData = { waist: number; neck: number; hip: number };
type BioSpecificData = { resistance: number; reactance: number };
type SkinfoldSpecificData = {
  protocol: SkinfoldProtocol;
  biceps: number;
  chest: number;
  midaxillary: number;
  triceps: number;
  subscapular: number;
  abdominal: number;
  suprailiac: number;
  thigh: number;
};

type NavyErrors = Partial<Record<keyof NavyAssessmentInput, string>>;
type BioErrors = Partial<Record<keyof BioimpedanceInput, string>>;
type SkinfoldErrors = Partial<Record<SkinfoldMeasurementKey | 'weight' | 'height' | 'age', string>>;
type ImcErrors = Partial<Record<'weight' | 'height' | 'age', string>>;

const SKINFOLD_MEASUREMENT_KEYS: SkinfoldMeasurementKey[] = [
  'biceps',
  'chest',
  'midaxillary',
  'triceps',
  'subscapular',
  'abdominal',
  'suprailiac',
  'thigh',
];

const initialCommonData: BaseAssessmentInput = {
  weight: 0,
  height: 0,
  age: 0,
  gender: 'male',
  activityLevel: 'sedentary',
  objective: 'maintenance',
};
const initialCommonInputValues: CommonInputValues = { weight: '', height: '', age: '' };
const initialNavyData: NavySpecificData = { waist: 0, neck: 0, hip: 0 };
const initialNavyInputValues: NavySpecificInputValues = { waist: '', neck: '', hip: '' };
const initialBioData: BioSpecificData = { resistance: 0, reactance: 0 };
const initialBioInputValues: BioSpecificInputValues = { resistance: '', reactance: '' };
const initialSkinfoldData: SkinfoldSpecificData = {
  protocol: 'jp3',
  biceps: 0,
  chest: 0,
  midaxillary: 0,
  triceps: 0,
  subscapular: 0,
  abdominal: 0,
  suprailiac: 0,
  thigh: 0,
};
const initialSkinfoldInputValues: SkinfoldSpecificInputValues = {
  biceps: '',
  chest: '',
  midaxillary: '',
  triceps: '',
  subscapular: '',
  abdominal: '',
  suprailiac: '',
  thigh: '',
};

type SavedData = {
  commonData?: BaseAssessmentInput;
  commonInputValues?: CommonInputValues;
  navyData?: NavySpecificData;
  navyInputValues?: NavySpecificInputValues;
  bioData?: BioSpecificData;
  bioInputValues?: BioSpecificInputValues;
  skinfoldData?: SkinfoldSpecificData;
  skinfoldInputValues?: SkinfoldSpecificInputValues;
  results?: Record<AssessmentMethod, Result | null>;
  assessmentNotes?: string;
};

function getSavedData(): SavedData | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as SavedData) : null;
  } catch {
    return null;
  }
}

export function useAssessmentState() {
  const saved = getSavedData();

  const [commonData, setCommonData] = useState<BaseAssessmentInput>(
    saved?.commonData ?? initialCommonData
  );
  const [commonInputValues, setCommonInputValues] = useState<CommonInputValues>(
    saved?.commonInputValues ?? initialCommonInputValues
  );
  const [navyData, setNavyData] = useState<NavySpecificData>(saved?.navyData ?? initialNavyData);
  const [navyInputValues, setNavyInputValues] = useState<NavySpecificInputValues>(
    saved?.navyInputValues ?? initialNavyInputValues
  );
  const [navyErrors, setNavyErrors] = useState<NavyErrors>({});

  const [bioData, setBioData] = useState<BioSpecificData>(saved?.bioData ?? initialBioData);
  const [bioInputValues, setBioInputValues] = useState<BioSpecificInputValues>(
    saved?.bioInputValues ?? initialBioInputValues
  );
  const [bioErrors, setBioErrors] = useState<BioErrors>({});

  const [skinfoldData, setSkinfoldData] = useState<SkinfoldSpecificData>(
    saved?.skinfoldData ?? initialSkinfoldData
  );
  const [skinfoldInputValues, setSkinfoldInputValues] = useState<SkinfoldSpecificInputValues>(
    saved?.skinfoldInputValues ?? initialSkinfoldInputValues
  );
  const [skinfoldErrors, setSkinfoldErrors] = useState<SkinfoldErrors>({});

  const [imcErrors, setImcErrors] = useState<ImcErrors>({});

  const [results, setResults] = useState<Record<AssessmentMethod, Result | null>>(
    saved?.results ?? { navy: null, bioimpedance: null, skinfold: null, imc: null }
  );
  const [assessmentNotes, setAssessmentNotes] = useState<string>(saved?.assessmentNotes ?? '');

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        commonData,
        commonInputValues,
        navyData,
        navyInputValues,
        bioData,
        bioInputValues,
        skinfoldData,
        skinfoldInputValues,
        results,
        assessmentNotes,
      })
    );
  }, [
    commonData,
    commonInputValues,
    navyData,
    navyInputValues,
    bioData,
    bioInputValues,
    skinfoldData,
    skinfoldInputValues,
    results,
    assessmentNotes,
  ]);

  // ── dados completos para passar às calculadoras ───────────
  const fullNavyData: NavyAssessmentInput = { ...commonData, ...navyData };
  const fullBioData: BioimpedanceInput = { ...commonData, ...bioData };
  const fullSkinfoldData: SkinfoldInput = { ...commonData, ...skinfoldData };
  const fullNavyInputValues: NavyInputValues = { ...commonInputValues, ...navyInputValues };
  const fullBioInputValues: BioimpedanceInputValues = { ...commonInputValues, ...bioInputValues };
  const fullSkinfoldInputValues: SkinfoldInputValues = {
    ...commonInputValues,
    ...skinfoldInputValues,
  };

  // ── handler comum ─────────────────────────────────────────
  function handleCommonChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;

    if (name === 'weight' || name === 'height' || name === 'age') {
      const isDecimal = name === 'weight' || name === 'height';
      const displayValue = isDecimal ? value.replace(',', '.') : value;
      if (isDecimal && !/^\d*\.?\d*$/.test(displayValue)) return;
      if (!isDecimal && !/^\d*$/.test(value)) return;
      const numericValue = displayValue === '' || displayValue === '.' ? 0 : Number(displayValue);
      setCommonInputValues((prev) => ({ ...prev, [name]: value }));
      setCommonData((prev) => ({ ...prev, [name]: numericValue }));
    } else if (name === 'gender') {
      setCommonData((prev) => ({ ...prev, gender: value as 'male' | 'female' }));
      if (value === 'male') {
        setNavyData((prev) => ({ ...prev, hip: 0 }));
        setNavyInputValues((prev) => ({ ...prev, hip: '' }));
        setNavyErrors((prev) => ({ ...prev, hip: undefined }));
      }
    } else {
      setCommonData((prev) => ({ ...prev, [name]: value }));
    }
  }

  // ── handlers navy ─────────────────────────────────────────
  function handleNavyChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;

    if (['weight', 'height', 'age', 'gender', 'activityLevel', 'objective'].includes(name)) {
      setNavyErrors((prev) => ({ ...prev, [name]: undefined }));
      handleCommonChange(e);
      return;
    }

    if (name === 'waist' || name === 'neck' || name === 'hip') {
      setNavyErrors((prev) => ({ ...prev, [name]: undefined }));
      const displayValue = value.replace(',', '.');
      if (!/^\d*\.?\d*$/.test(displayValue)) return;
      const numericValue = displayValue === '' || displayValue === '.' ? 0 : Number(displayValue);
      setNavyInputValues((prev) => ({ ...prev, [name]: value }));
      setNavyData((prev) => ({ ...prev, [name]: numericValue }));
    }
  }

  const resetCommon = () => {
    setCommonData({ ...initialCommonData, gender: commonData.gender });
    setCommonInputValues(initialCommonInputValues);
    clearAllErrors();
  };

  function resetNavy() {
    setNavyData(initialNavyData);
    setNavyInputValues(initialNavyInputValues);
    setNavyErrors({});
    setResults((prev) => ({ ...prev, navy: null }));
    resetCommon();
  }

  // ── handlers bio ──────────────────────────────────────────
  function handleBioChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;

    if (['weight', 'height', 'age', 'gender', 'activityLevel', 'objective'].includes(name)) {
      setBioErrors((prev) => ({ ...prev, [name]: undefined }));
      handleCommonChange(e);
      return;
    }

    if (name === 'resistance' || name === 'reactance') {
      setBioErrors((prev) => ({ ...prev, [name]: undefined }));
      const displayValue = value.replace(',', '.');
      if (!/^\d*\.?\d*$/.test(displayValue)) return;
      const numericValue = displayValue === '' || displayValue === '.' ? 0 : Number(displayValue);
      setBioInputValues((prev) => ({ ...prev, [name]: value }));
      setBioData((prev) => ({ ...prev, [name]: numericValue }));
    }
  }

  function resetBio() {
    setBioData(initialBioData);
    setBioInputValues(initialBioInputValues);
    setBioErrors({});
    setResults((prev) => ({ ...prev, bioimpedance: null }));
    resetCommon();
  }

  function resetImc() {
    setCommonData({ ...initialCommonData, gender: commonData.gender });
    setCommonInputValues(initialCommonInputValues);
    setImcErrors({});
    setResults((prev) => ({ ...prev, imc: null }));
  }

  // ── handlers skinfold ─────────────────────────────────────
  function handleSkinfoldChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;

    if (['weight', 'height', 'age', 'gender', 'activityLevel', 'objective'].includes(name)) {
      setSkinfoldErrors((prev) => ({ ...prev, [name]: undefined }));
      handleCommonChange(e);

      if (name === 'gender') {
        const nextFullData = { ...fullSkinfoldData, gender: value as 'male' | 'female' };
        const nextFields = getRequiredSkinfoldFields(nextFullData);
        const removedFields = SKINFOLD_MEASUREMENT_KEYS.filter((f) => !nextFields.includes(f));
        setSkinfoldData((prev) => {
          const updated = { ...prev };
          removedFields.forEach((f) => {
            updated[f] = 0;
          });
          return updated;
        });
        setSkinfoldInputValues((prev) => {
          const updated = { ...prev };
          removedFields.forEach((f) => {
            updated[f] = '';
          });
          return updated;
        });
        setSkinfoldErrors((prev) => {
          const updated = { ...prev };
          removedFields.forEach((f) => {
            delete updated[f];
          });
          return updated;
        });
      }
      return;
    }

    if (name === 'protocol') {
      const nextFullData = { ...fullSkinfoldData, protocol: value as SkinfoldProtocol };
      const nextFields = getRequiredSkinfoldFields(nextFullData);
      const removedFields = SKINFOLD_MEASUREMENT_KEYS.filter((f) => !nextFields.includes(f));
      setSkinfoldData((prev) => {
        const updated = { ...prev, protocol: value as SkinfoldProtocol };
        removedFields.forEach((f) => {
          updated[f] = 0;
        });
        return updated;
      });
      setSkinfoldInputValues((prev) => {
        const updated = { ...prev };
        removedFields.forEach((f) => {
          updated[f] = '';
        });
        return updated;
      });
      setSkinfoldErrors((prev) => {
        const updated = { ...prev };
        removedFields.forEach((f) => {
          delete updated[f];
        });
        return updated;
      });
      return;
    }

    if (SKINFOLD_MEASUREMENT_KEYS.includes(name as SkinfoldMeasurementKey)) {
      setSkinfoldErrors((prev) => ({ ...prev, [name]: undefined }));

      const displayValue = value.replace(',', '.');

      if (!/^\d*\.?\d*$/.test(displayValue)) return;

      const numericValue = displayValue === '' || displayValue === '.' ? 0 : Number(displayValue);

      setSkinfoldInputValues((prev) => ({ ...prev, [name]: value }));
      setSkinfoldData((prev) => ({ ...prev, [name]: numericValue }));
    }
  }

  const clearAllErrors = () => {
    setNavyErrors({});
    setBioErrors({});
    setSkinfoldErrors({});
    setImcErrors({});
  };

  function resetSkinfold() {
    setSkinfoldData(initialSkinfoldData);
    setSkinfoldInputValues(initialSkinfoldInputValues);
    setSkinfoldErrors({});
    setResults((prev) => ({ ...prev, skinfold: null }));
    resetCommon();
  }

  return {
    // dados completos para as calculadoras
    fullNavyData,
    fullBioData,
    fullSkinfoldData,
    fullNavyInputValues,
    fullBioInputValues,
    fullSkinfoldInputValues,

    // dados comuns (para IMC)
    commonData,
    commonInputValues,

    // erros
    navyErrors,
    setNavyErrors,
    imcErrors,
    setImcErrors,
    bioErrors,
    setBioErrors,
    skinfoldErrors,
    setSkinfoldErrors,

    // resultados
    results,
    setResults,

    // notas
    assessmentNotes,
    setAssessmentNotes,

    // handlers
    handleCommonChange,
    handleNavyChange,
    handleBioChange,
    handleSkinfoldChange,

    // resets
    resetNavy,
    resetBio,
    resetSkinfold,
    resetImc,
  };
}
