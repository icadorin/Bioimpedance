import { useState } from 'react';
import type { AssessmentMethod } from '../types/assessment.types';
import type { NavyAssessmentInput } from '../types/assessment-input.types';
import type { BioimpedanceInput } from '../types/bioimpedance.types';
import type { SkinfoldInput } from '../types/skinfold.types';
import type { RangeRule } from '../constants/rangeRules';

import NavyCalculator from '../components/calculators/NavyCalculator';
import BioimpedanceCalculator from '../components/calculators/BioimpedanceCalculator';
import SkinfoldCalculator from '../components/calculators/SkinfoldCalculator';
import ImcCalculator from '../components/calculators/ImcCalculator';
import ResultCards from '../components/ResultCards';
import { InputField } from '../../../components/shared/InputField';

import { methodOptions } from '../config/selectOptions';
import { BIO_RANGE_RULES, SKINFOLD_RANGE_RULES } from '../constants/rangeRules';
import { EMPTY_MESSAGES, INVALID_MESSAGES } from '../constants/validationMessages';
import { userSchema } from '../validation/userSchema';

import {
  calculateIMC,
  calculateBMR,
  calculateTDEE,
  calculateBodyFat,
  calculateLeanMass,
  calculateFatMass,
  calculateFFMI,
} from '../utils/calculations';
import {
  calculateBioImpedance,
  calculateBodyFatBio,
  calculatePhaseAngle,
  calculateTBW,
} from '../utils/calculationsBio';
import {
  calculateBodyFatSkinfold,
  calculateSkinfoldDensity,
  calculateSkinfoldSum,
  getRequiredSkinfoldFields,
} from '../utils/calculationsSkin';
import { interpretBodyFat, classifyIMC } from '../utils/interpretation';
import { generateRecommendation } from '../utils/recommendationEngine';

import { useAssessmentState } from '../hooks/useAssessmentState';
import '../styles/newAssessment.css';

function getRangeError(value: number, rule?: RangeRule): string | undefined {
  if (!rule) return undefined;
  if (!value || Number.isNaN(value)) return rule.emptyMessage;
  if (value < rule.min || value > rule.max) return rule.invalidMessage;
  return undefined;
}

export default function NewAssessment() {
  const [method, setMethod] = useState<AssessmentMethod>('navy');

  const {
    fullNavyData,
    fullBioData,
    fullSkinfoldData,
    fullNavyInputValues,
    fullBioInputValues,
    fullSkinfoldInputValues,
    commonData,
    navyErrors,
    setNavyErrors,
    imcErrors,
    setImcErrors,
    bioErrors,
    setBioErrors,
    skinfoldErrors,
    setSkinfoldErrors,
    results,
    setResults,
    assessmentNotes,
    setAssessmentNotes,
    handleNavyChange,
    handleBioChange,
    handleSkinfoldChange,
    handleCommonChange,
    resetNavy,
    resetBio,
    resetSkinfold,
    resetImc,
  } = useAssessmentState();

  const currentResult = results[method];

  // ── navy ──────────────────────────────────────────────────
  function friendlyMessage(field: keyof NavyAssessmentInput, value: number): string {
    if (value === 0)
      return EMPTY_MESSAGES[field as keyof typeof EMPTY_MESSAGES] ?? 'Campo obrigatório';
    return INVALID_MESSAGES[field as keyof typeof INVALID_MESSAGES] ?? 'Valor inválido';
  }

  function handleCalculate() {
    const parsed = userSchema.safeParse(fullNavyData);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof NavyAssessmentInput, string>> = {};
      parsed.error.issues.forEach((err) => {
        const field = err.path[0] as keyof NavyAssessmentInput;
        const value = typeof fullNavyData[field] === 'number' ? (fullNavyData[field] as number) : 0;
        fieldErrors[field] = friendlyMessage(field, value);
      });
      setNavyErrors(fieldErrors);
      return;
    }

    setNavyErrors({});
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
    const navyBaseMeasurement =
      validData.gender === 'male'
        ? validData.waist - validData.neck
        : validData.waist + validData.hip - validData.neck;

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
        carbs: recommendation.carbs,
        fat: recommendation.fat,
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
            {
              label: 'Medida base',
              value: `${navyBaseMeasurement.toFixed(1)} cm`,
              description: 'Valor principal usado no cálculo',
            },
            {
              label: 'Medidas usadas',
              value:
                validData.gender === 'male' ? 'Cintura e pescoço' : 'Cintura, pescoço e quadril',
              description: 'Circunferências utilizadas na fórmula',
            },
          ],
        },
      },
    }));
  }

  // ── bio ───────────────────────────────────────────────────
  function handleBioCalculate() {
    const newErrors: Partial<Record<keyof BioimpedanceInput, string>> = {};
    const fieldsToValidate: (keyof BioimpedanceInput)[] = [
      'weight',
      'height',
      'age',
      'resistance',
      'reactance',
    ];

    fieldsToValidate.forEach((field) => {
      const error = getRangeError(fullBioData[field] as number, BIO_RANGE_RULES[field]);
      if (error) newErrors[field] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setBioErrors(newErrors);
      return;
    }
    setBioErrors({});

    const { weight, height } = fullBioData;
    const bioAsUserInput = { ...fullBioData, waist: 0, neck: 0, hip: 0 };
    const bodyFat = calculateBodyFatBio(fullBioData);
    const leanMass = calculateLeanMass(weight, bodyFat);
    const fatMass = calculateFatMass(weight, bodyFat);
    const imc = calculateIMC(bioAsUserInput);
    const bmr = calculateBMR(bioAsUserInput);
    const tdee = calculateTDEE(bioAsUserInput, bmr);
    const ffmi = calculateFFMI(leanMass, height);
    const bodyFatLevel = interpretBodyFat(fullBioData.gender, bodyFat);
    const recommendation = generateRecommendation(bioAsUserInput, tdee, bodyFat);
    const impedance = calculateBioImpedance(fullBioData);
    const phaseAngle = calculatePhaseAngle(fullBioData);
    const tbw = calculateTBW(fullBioData);

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
        carbs: recommendation.carbs,
        fat: recommendation.fat,
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

  // ── skinfold ──────────────────────────────────────────────
  function handleSkinfoldCalculate() {
    const newErrors: Partial<Record<keyof SkinfoldInput, string>> = {};
    const fieldsToValidate = [
      'weight',
      'height',
      'age',
      ...getRequiredSkinfoldFields(fullSkinfoldData),
    ] as (keyof SkinfoldInput)[];

    fieldsToValidate.forEach((field) => {
      const error = getRangeError(fullSkinfoldData[field] as number, SKINFOLD_RANGE_RULES[field]);
      if (error) newErrors[field] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setSkinfoldErrors(newErrors);
      return;
    }
    setSkinfoldErrors({});

    const { weight, height } = fullSkinfoldData;
    const skinfoldAsUserInput: NavyAssessmentInput = { ...commonData, waist: 0, neck: 0, hip: 0 };
    const bodyFat = calculateBodyFatSkinfold(fullSkinfoldData);
    const leanMass = calculateLeanMass(weight, bodyFat);
    const fatMass = calculateFatMass(weight, bodyFat);
    const imc = calculateIMC(skinfoldAsUserInput);
    const bmr = calculateBMR(skinfoldAsUserInput);
    const tdee = calculateTDEE(skinfoldAsUserInput, bmr);
    const ffmi = calculateFFMI(leanMass, height);
    const bodyFatLevel = interpretBodyFat(fullSkinfoldData.gender, bodyFat);
    const recommendation = generateRecommendation(skinfoldAsUserInput, tdee, bodyFat);
    const skinfoldSum = calculateSkinfoldSum(fullSkinfoldData);
    const bodyDensity = calculateSkinfoldDensity(fullSkinfoldData);
    const protocolLabel =
      fullSkinfoldData.protocol === 'jp3'
        ? 'Jackson-Pollock 3 dobras'
        : fullSkinfoldData.protocol === 'jp7'
          ? 'Jackson-Pollock 7 dobras'
          : fullSkinfoldData.protocol === 'dw4'
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
        carbs: recommendation.carbs,
        fat: recommendation.fat,
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

  // ── imc ───────────────────────────────────────────────────
  function handleImcCalculate() {
    const newErrors: Partial<Record<keyof NavyAssessmentInput, string>> = {};
    if (!commonData.weight || commonData.weight < 20 || commonData.weight > 300)
      newErrors.weight =
        commonData.weight === 0 ? 'Informe seu peso' : 'Peso deve ser entre 20 e 300 kg';
    if (!commonData.height || commonData.height < 50 || commonData.height > 250)
      newErrors.height =
        commonData.height === 0 ? 'Informe sua altura' : 'Altura deve ser entre 50 e 250 cm';
    if (!commonData.age || commonData.age < 10 || commonData.age > 100)
      newErrors.age =
        commonData.age === 0 ? 'Informe sua idade' : 'Idade deve ser entre 10 e 100 anos';

    if (Object.keys(newErrors).length > 0) {
      setImcErrors(newErrors);
      return;
    }
    setImcErrors({});

    const dataForCalc: NavyAssessmentInput = { ...commonData, waist: 0, neck: 0, hip: 0 };
    const bmr = calculateBMR(dataForCalc);
    const tdee = calculateTDEE(dataForCalc, bmr);
    const imc = calculateIMC(dataForCalc);
    const recommendation = generateRecommendation(dataForCalc, tdee, 0);

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
        carbs: recommendation.carbs,
        fat: recommendation.fat,
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
            {
              label: 'Faixa saudável',
              value: '18.5 – 24.9',
              description: 'Intervalo considerado saudável pela OMS',
            },
            {
              label: 'Limitação',
              value: 'Atenção',
              description: 'Não diferencia massa magra de gordura corporal',
            },
          ],
        },
      },
    }));
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
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setMethod(e.target.value as AssessmentMethod)
                }
              />
            </div>

            {method === 'navy' && (
              <NavyCalculator
                data={fullNavyData}
                inputValues={fullNavyInputValues}
                errors={navyErrors}
                handleChange={handleNavyChange}
                handleCalculate={handleCalculate}
                handleReset={resetNavy}
              />
            )}
            {method === 'bioimpedance' && (
              <BioimpedanceCalculator
                data={fullBioData}
                inputValues={fullBioInputValues}
                errors={bioErrors}
                handleChange={handleBioChange}
                handleCalculate={handleBioCalculate}
                handleReset={resetBio}
              />
            )}
            {method === 'skinfold' && (
              <SkinfoldCalculator
                data={fullSkinfoldData}
                inputValues={fullSkinfoldInputValues}
                errors={skinfoldErrors}
                handleChange={handleSkinfoldChange}
                handleCalculate={handleSkinfoldCalculate}
                handleReset={resetSkinfold}
              />
            )}
            {method === 'imc' && (
              <ImcCalculator
                data={fullNavyData}
                inputValues={fullNavyInputValues}
                errors={imcErrors}
                handleChange={handleCommonChange}
                handleCalculate={handleImcCalculate}
                handleReset={resetImc}
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
