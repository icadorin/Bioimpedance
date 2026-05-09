import { useEffect, useState } from 'react';
import { userSchema } from '../../../validation/userSchema';
import type { UserInput } from '../../../types';
import type { InputValues } from '../../../types/input.types';
import type { PhysicResult, RecommendationResult } from '../../../types/result.types';
import type { AssessmentMethod } from '../../../types/assessment.types';
import type { BioimpedanceInput, BioimpedanceInputValues } from '../../../types/bioimpedance.types';
import { interpretBodyFat, classifyIMC } from '../../../utils/interpretation';
import { generateRecommendation } from '../../../utils/recommendationEngine';
import { STORAGE_KEY } from '../../../config/storage';
import { InputField } from '../../../components/InputField';
import { methodOptions } from '../../../config/selectOptions';
import { parseNumericInput } from '../../../utils/parseNumericInput';
import { EMPTY_MESSAGES, INVALID_MESSAGES } from '../../../constants/validationMessages';
import type {
  SkinfoldInput,
  SkinfoldInputValues,
  SkinfoldMeasurementKey,
} from '../../../types/skinfold.types';
import {
  calculateIMC,
  calculateBMR,
  calculateTDEE,
  calculateBodyFat,
  calculateLeanMass,
  calculateFatMass,
  calculateFFMI,
} from '../../../utils/calculations';
import {
  calculateBioImpedance,
  calculateBodyFatBio,
  calculatePhaseAngle,
  calculateTBW,
} from '../../../utils/bioimpedance/calculations';
import {
  calculateBodyFatSkinfold,
  calculateSkinfoldDensity,
  calculateSkinfoldSum,
  getRequiredSkinfoldFields,
} from '../../../utils/skinfold/calculations';
import {
  initialNavyData,
  initialNavyInputValues,
  initialBioData,
  initialBioInputValues,
  initialSkinfoldData,
  initialSkinfoldInputValues,
} from '../../../config/initialStates';
import {
  navyNumericKeys,
  navyDecimalKeys,
  bioNumericKeys,
  bioDecimalKeys,
  skinfoldNumericKeys,
  skinfoldDecimalKeys,
} from '../../../config/numericFields';
import {
  BIO_RANGE_RULES,
  SKINFOLD_RANGE_RULES,
  type RangeRule,
} from '../../../constants/rangeRules';
import NavyCalculator from '../../../components/calculators/NavyCalculator';
import BioimpedanceCalculator from '../../../components/calculators/BioimpedanceCalculator';
import SkinfoldCalculator from '../../../components/calculators/SkinfoldCalculator';
import ImcCalculator from '../../../components/calculators/ImcCalculator';
import ResultCards from '../../../components/ResultCards';

import '../../../styles/newAssessment.css';

type Result = PhysicResult & RecommendationResult;

type SavedCalculatorData = {
  data?: UserInput;
  inputValues?: InputValues;
  bioData?: BioimpedanceInput;
  bioInputValues?: BioimpedanceInputValues;
  skinfoldData?: SkinfoldInput;
  skinfoldInputValues?: SkinfoldInputValues;
  results?: Record<AssessmentMethod, Result | null>;
};

function getRangeError(value: number, rule?: RangeRule): string | undefined {
  if (!rule) return undefined;
  if (!value || Number.isNaN(value)) return rule.emptyMessage;
  if (value < rule.min || value > rule.max) return rule.invalidMessage;

  return undefined;
}

function getSavedData(): SavedCalculatorData | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as SavedCalculatorData) : null;
  } catch {
    return null;
  }
}

export default function NewAssessment() {
  const [savedData] = useState<SavedCalculatorData | null>(() => getSavedData());

  // ── método ──────────────────────────────────────────────
  const [method, setMethod] = useState<AssessmentMethod>('navy');

  // ── navy ─────────────────────────────────────────────────
  const [data, setData] = useState<UserInput>(savedData?.data || initialNavyData);

  const [inputValues, setInputValues] = useState<InputValues>(
    savedData?.inputValues || initialNavyInputValues
  );

  const [errors, setErrors] = useState<Partial<Record<keyof UserInput, string>>>({});

  // ── bioimpedância ─────────────────────────────────────────
  const [bioData, setBioData] = useState<BioimpedanceInput>(savedData?.bioData || initialBioData);

  const [bioInputValues, setBioInputValues] = useState<BioimpedanceInputValues>(
    savedData?.bioInputValues || initialBioInputValues
  );

  const [bioErrors, setBioErrors] = useState<Partial<Record<keyof BioimpedanceInput, string>>>({});

  // ── dobras cutâneas ───────────────────────────────────────
  const [skinfoldData, setSkinfoldData] = useState<SkinfoldInput>(
    savedData?.skinfoldData || initialSkinfoldData
  );

  const [skinfoldInputValues, setSkinfoldInputValues] = useState<SkinfoldInputValues>(
    savedData?.skinfoldInputValues || initialSkinfoldInputValues
  );

  const [skinfoldErrors, setSkinfoldErrors] = useState<
    Partial<Record<keyof SkinfoldInput, string>>
  >({});

  // ── resultado compartilhado ───────────────────────────────
  const [results, setResults] = useState<Record<AssessmentMethod, Result | null>>(
    savedData?.results || {
      navy: null,
      bioimpedance: null,
      skinfold: null,
      imc: null,
    }
  );

  const [assessmentNotes, setAssessmentNotes] = useState<string>('');

  const currentResult = results[method];

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        data,
        inputValues,
        bioData,
        bioInputValues,
        skinfoldData,
        skinfoldInputValues,
        results,
      })
    );
  }, [data, inputValues, bioData, bioInputValues, skinfoldData, skinfoldInputValues, results]);

  function handleNavyChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    const key = name as keyof UserInput;

    setErrors((prev) => ({ ...prev, [key]: undefined }));

    if (navyNumericKeys.includes(key)) {
      const parsed = parseNumericInput(value, navyDecimalKeys.includes(key));
      if (!parsed) return;
      setInputValues((prev) => ({ ...prev, [key]: value }));
      setData((prev) => ({ ...prev, [key]: parsed.numericValue }));
    } else {
      if (key === 'gender' && value === 'male') {
        setData((prev) => ({ ...prev, gender: 'male', hip: 0 }));
        setInputValues((prev) => ({ ...prev, hip: '' }));
        setErrors((prev) => ({ ...prev, hip: undefined }));
      } else {
        setData((prev) => ({ ...prev, [key]: value }));
      }
    }
  }

  function friendlyMessage(field: keyof UserInput, value: number): string {
    if (value === 0) {
      return EMPTY_MESSAGES[field] ?? 'Campo obrigatório';
    }

    return INVALID_MESSAGES[field] ?? 'Valor inválido';
  }

  function handleCalculate() {
    const parsed = userSchema.safeParse(data);

    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof UserInput, string>> = {};
      parsed.error.issues.forEach((err) => {
        const field = err.path[0] as keyof UserInput;
        const value = typeof data[field] === 'number' ? (data[field] as number) : 0;
        fieldErrors[field] = friendlyMessage(field, value);
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    const validData = parsed.data;

    const bmr = calculateBMR(validData);
    const tdee = calculateTDEE(validData, bmr);
    const bodyFat = calculateBodyFat(validData);
    const leanMass = calculateLeanMass(validData.weight, bodyFat);
    const fatMass = calculateFatMass(validData.weight, bodyFat);
    const ffmi = calculateFFMI(leanMass, validData.height);
    const imc = calculateIMC(validData);
    const bodyFatLevel = interpretBodyFat(validData.gender, bodyFat);
    const recommendation = generateRecommendation(validData, tdee, bodyFat);

    setResults((prev) => ({
      ...prev,
      navy: {
        imc,
        bmr,
        tdee,
        bodyFat,
        leanMass,
        fatMass,
        ffmi,
        bodyFatLevel,
        targetCalories: recommendation.calories,
        protein: recommendation.protein,
        cardio: recommendation.cardio,
        notes: recommendation.notes,
        trainingType: recommendation.trainingType,
        methodDetails: {
          title: 'Detalhes do método',
          items: [
            {
              label: 'Método',
              value: 'US Navy',
              description: 'Estimativa baseada em circunferências corporais',
            },
          ],
        },
      },
    }));
  }

  function handleReset() {
    localStorage.removeItem(STORAGE_KEY);

    setData({
      ...initialNavyData,
      gender: data.gender,
    });

    setInputValues(initialNavyInputValues);
    setErrors({});

    setResults((prev) => ({
      ...prev,
      navy: null,
    }));
  }

  // ── handlers bio ──────────────────────────────────────────
  function handleBioChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    const key = name as keyof BioimpedanceInput;

    setBioErrors((prev) => ({ ...prev, [key]: undefined }));

    if (bioNumericKeys.includes(key)) {
      const parsed = parseNumericInput(value, bioDecimalKeys.includes(key));
      if (!parsed) return;
      setBioInputValues((prev) => ({ ...prev, [key]: value }));
      setBioData((prev) => ({ ...prev, [key]: parsed.numericValue }));
    } else {
      setBioData((prev) => ({ ...prev, [key]: value }));
    }
  }

  function handleBioCalculate() {
    const { weight, height } = bioData;
    const newErrors: Partial<Record<keyof BioimpedanceInput, string>> = {};
    const fieldsToValidate: (keyof BioimpedanceInput)[] = [
      'weight',
      'height',
      'age',
      'resistance',
      'reactance',
    ];

    fieldsToValidate.forEach((field) => {
      const error = getRangeError(bioData[field] as number, BIO_RANGE_RULES[field]);

      if (error) {
        newErrors[field] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setBioErrors(newErrors);
      return;
    }

    setBioErrors({});

    const bioAsUserInput = { ...bioData, waist: 0, neck: 0, hip: 0 };
    const bodyFat = calculateBodyFatBio(bioData);
    const leanMass = calculateLeanMass(weight, bodyFat);
    const fatMass = calculateFatMass(weight, bodyFat);
    const imc = calculateIMC(bioAsUserInput);
    const bmr = calculateBMR(bioAsUserInput);
    const tdee = calculateTDEE(bioAsUserInput, bmr);
    const ffmi = calculateFFMI(leanMass, height);
    const bodyFatLevel = interpretBodyFat(bioData.gender, bodyFat);
    const recommendation = generateRecommendation(bioAsUserInput, tdee, bodyFat);
    const impedance = calculateBioImpedance(bioData);
    const phaseAngle = calculatePhaseAngle(bioData);
    const tbw = calculateTBW(bioData);

    setResults((prev) => ({
      ...prev,
      bioimpedance: {
        imc,
        bmr,
        tdee,
        bodyFat,
        leanMass,
        fatMass,
        ffmi,
        bodyFatLevel,
        targetCalories: recommendation.calories,
        protein: recommendation.protein,
        cardio: recommendation.cardio,
        notes: recommendation.notes,
        trainingType: recommendation.trainingType,
        methodDetails: {
          title: 'Detalhes da bioimpedância',
          items: [
            {
              label: 'Impedância',
              value: `${impedance.toFixed(1)} ohms`,
              description: 'Resistência elétrica corporal total',
            },
            {
              label: 'Ângulo de fase',
              value: `${phaseAngle.toFixed(1)} graus`,
              description: 'Indicador associado à saúde celular',
            },
            {
              label: 'Água corporal',
              value: `${tbw.toFixed(1)} L`,
              description: 'Estimativa de água total no organismo',
            },
          ],
        },
      },
    }));
  }

  function handleBioReset() {
    setBioData(initialBioData);
    setBioInputValues(initialBioInputValues);
    setBioErrors({});

    setResults((prev) => ({
      ...prev,
      bioimpedance: null,
    }));
  }

  // ── handlers dobras cutâneas ──────────────────────────────
  function handleSkinfoldChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    const key = name as keyof SkinfoldInput;

    if (key === 'protocol' || key === 'gender') {
      // descobre quais campos vão sumir com o novo valor
      const nextData = { ...skinfoldData, [key]: value };
      const nextFields = getRequiredSkinfoldFields(nextData);
      const allMeasurementKeys: SkinfoldMeasurementKey[] = [
        'biceps',
        'chest',
        'midaxillary',
        'triceps',
        'subscapular',
        'abdominal',
        'suprailiac',
        'thigh',
      ];
      const removedFields = allMeasurementKeys.filter((f) => !nextFields.includes(f));

      // reseta dados e erros dos campos removidos
      setSkinfoldData((prev) => {
        const updated = { ...prev, [key]: value };
        removedFields.forEach((f) => {
          (updated as Record<SkinfoldMeasurementKey, number>)[f] = 0;
        });
        return updated;
      });
      setSkinfoldInputValues((prev) => {
        const updated = { ...prev };
        removedFields.forEach((f) => {
          (updated as Record<SkinfoldMeasurementKey, string>)[f] = '';
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

    setSkinfoldErrors((prev) => ({ ...prev, [key]: undefined }));

    if (skinfoldNumericKeys.includes(key)) {
      const parsed = parseNumericInput(value, skinfoldDecimalKeys.includes(key));
      if (!parsed) return;
      setSkinfoldInputValues((prev) => ({ ...prev, [key as keyof SkinfoldInputValues]: value }));
      setSkinfoldData((prev) => ({ ...prev, [key]: parsed.numericValue }));
    } else {
      setSkinfoldData((prev) => ({ ...prev, [key]: value }));
    }
  }

  function handleSkinfoldCalculate() {
    const { weight, height } = skinfoldData;
    const newErrors: Partial<Record<keyof SkinfoldInput, string>> = {};
    const fieldsToValidate: (keyof SkinfoldInput)[] = [
      'weight',
      'height',
      'age',
      ...getRequiredSkinfoldFields(skinfoldData),
    ];

    fieldsToValidate.forEach((field) => {
      const error = getRangeError(skinfoldData[field] as number, SKINFOLD_RANGE_RULES[field]);

      if (error) {
        newErrors[field] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setSkinfoldErrors(newErrors);
      return;
    }

    setSkinfoldErrors({});

    const skinfoldAsUserInput: UserInput = {
      weight: skinfoldData.weight,
      height: skinfoldData.height,
      age: skinfoldData.age,
      gender: skinfoldData.gender,
      activityLevel: skinfoldData.activityLevel,
      objective: skinfoldData.objective,
      waist: 0,
      neck: 0,
      hip: 0,
    };

    const bodyFat = calculateBodyFatSkinfold(skinfoldData);
    const leanMass = calculateLeanMass(weight, bodyFat);
    const fatMass = calculateFatMass(weight, bodyFat);
    const imc = calculateIMC(skinfoldAsUserInput);
    const bmr = calculateBMR(skinfoldAsUserInput);
    const tdee = calculateTDEE(skinfoldAsUserInput, bmr);
    const ffmi = calculateFFMI(leanMass, height);
    const bodyFatLevel = interpretBodyFat(skinfoldData.gender, bodyFat);
    const recommendation = generateRecommendation(skinfoldAsUserInput, tdee, bodyFat);
    const skinfoldSum = calculateSkinfoldSum(skinfoldData);
    const bodyDensity = calculateSkinfoldDensity(skinfoldData);
    const protocolLabel =
      skinfoldData.protocol === 'jp3'
        ? 'Jackson-Pollock 3 dobras'
        : skinfoldData.protocol === 'jp7'
          ? 'Jackson-Pollock 7 dobras'
          : skinfoldData.protocol === 'dw4'
            ? 'Durnin-Womersley 4 dobras'
            : 'Protocolo desconhecido';

    setResults((prev) => ({
      ...prev,
      skinfold: {
        imc,
        bmr,
        tdee,
        bodyFat,
        leanMass,
        fatMass,
        ffmi,
        bodyFatLevel,
        targetCalories: recommendation.calories,
        protein: recommendation.protein,
        cardio: recommendation.cardio,
        notes: recommendation.notes,
        trainingType: recommendation.trainingType,
        methodDetails: {
          title: 'Detalhes das dobras',
          items: [
            {
              label: 'Protocolo',
              value: protocolLabel,
              description: 'Método utilizado para cálculo das dobras',
            },
            {
              label: 'Soma das dobras',
              value: `${skinfoldSum.toFixed(1)} mm`,
              description: 'Soma total das dobras medidas',
            },
            {
              label: 'Densidade corporal',
              value: bodyDensity.toFixed(4),
              description: 'Estimativa da densidade corporal',
            },
          ],
        },
      },
    }));
  }

  function handleSkinfoldReset() {
    setSkinfoldData(initialSkinfoldData);
    setSkinfoldInputValues(initialSkinfoldInputValues);
    setSkinfoldErrors({});

    setResults((prev) => ({
      ...prev,
      skinfold: null,
    }));
  }

  function handleImcCalculate() {
    const newErrors: Partial<Record<keyof UserInput, string>> = {};

    if (!data.weight || data.weight < 20 || data.weight > 300) {
      newErrors.weight = data.weight === 0 ? 'Informe seu peso' : 'Peso deve ser entre 20 e 300 kg';
    }
    if (!data.height || data.height < 50 || data.height > 250) {
      newErrors.height =
        data.height === 0 ? 'Informe sua altura' : 'Altura deve ser entre 50 e 250 cm';
    }
    if (!data.age || data.age < 10 || data.age > 100) {
      newErrors.age = data.age === 0 ? 'Informe sua idade' : 'Idade deve ser entre 10 e 100 anos';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const bmr = calculateBMR(data);
    const tdee = calculateTDEE(data, bmr);
    const imc = calculateIMC(data);
    const recommendation = generateRecommendation(data, tdee, 0);

    setResults((prev) => ({
      ...prev,
      imc: {
        imc,
        bmr,
        tdee,
        bodyFat: 0,
        leanMass: 0,
        fatMass: 0,
        ffmi: 0,
        bodyFatLevel: '—',
        targetCalories: recommendation.calories,
        protein: recommendation.protein,
        cardio: recommendation.cardio,
        notes: recommendation.notes,
        trainingType: recommendation.trainingType,
        methodDetails: {
          title: 'Detalhes do IMC',
          items: [
            {
              label: 'IMC',
              value: imc.toFixed(1),
              description: 'Índice de Massa Corporal (peso / altura²)',
            },
            {
              label: 'Classificação',
              value: classifyIMC(imc),
              description: 'Baseado nos critérios da OMS',
            },
          ],
        },
      },
    }));
  }

  function handleImcReset() {
    setData({ ...initialNavyData, gender: data.gender });
    setInputValues(initialNavyInputValues);
    setErrors({});
    setResults((prev) => ({ ...prev, imc: null }));
  }

  // ── render ────────────────────────────────────────────────
  return (
    <div className="container">
      <h1>Nova avaliação</h1>

      <div className="main-calculator-card">
        <div className="calculator-layout">
          <div className="left-panel">
            <div className="method-selector">
              <InputField
                type="select"
                label="Método de avaliação"
                name="method"
                value={method}
                options={methodOptions}
                onChange={(e) => setMethod(e.target.value as AssessmentMethod)}
              />
            </div>

            {method === 'navy' && (
              <NavyCalculator
                data={data}
                inputValues={inputValues}
                errors={errors}
                handleChange={handleNavyChange}
                handleCalculate={handleCalculate}
                handleReset={handleReset}
              />
            )}

            {method === 'bioimpedance' && (
              <BioimpedanceCalculator
                data={bioData}
                inputValues={bioInputValues}
                errors={bioErrors}
                handleChange={handleBioChange}
                handleCalculate={handleBioCalculate}
                handleReset={handleBioReset}
              />
            )}

            {method === 'skinfold' && (
              <SkinfoldCalculator
                data={skinfoldData}
                inputValues={skinfoldInputValues}
                errors={skinfoldErrors}
                handleChange={handleSkinfoldChange}
                handleCalculate={handleSkinfoldCalculate}
                handleReset={handleSkinfoldReset}
              />
            )}

            {method === 'imc' && (
              <ImcCalculator
                data={data}
                inputValues={inputValues}
                errors={errors}
                handleChange={handleNavyChange}
                handleCalculate={handleImcCalculate}
                handleReset={handleImcReset}
              />
            )}
            <div className="assessment-notes">
              <label className="field-label">Observações</label>
              <textarea
                value={assessmentNotes}
                onChange={(e) => setAssessmentNotes(e.target.value)}
                placeholder="Observações sobre a avaliação (opcional)"
                rows={4}
                maxLength={500}
              />
              <small className="notes-counter">{assessmentNotes.length}/500</small>
            </div>
          </div>

          <ResultCards result={currentResult} method={method} />
        </div>
      </div>
    </div>
  );
}
