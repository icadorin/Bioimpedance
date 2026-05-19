import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { AssessmentMethod } from '../types/assessment.types';
import type { NavyAssessmentInput } from '../types/assessment-input.types';
import type { BioimpedanceInput } from '../types/bioimpedance.types';
import { useAssessments } from '../hooks/useAssessments';
import NavyCalculator from '../components/calculators/NavyCalculator';
import BioimpedanceCalculator from '../components/calculators/BioimpedanceCalculator';
import SkinfoldCalculator from '../components/calculators/SkinfoldCalculator';
import ImcCalculator from '../components/calculators/ImcCalculator';
import ResultCards from '../components/ResultCards';
import ClientContextBar from '../../clients/components/client-profile/ClientContextBar';
import { InputField } from '../../../components/shared/InputField';
import { methodOptions } from '../config/selectOptions';
import { PROTOCOL_FIELDS } from '../constants/protocolFields';
import { EMPTY_MESSAGES, INVALID_MESSAGES } from '../constants/validationMessages';
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
  calculateBodyFatBio,
  calculateBioImpedance,
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
import { useClients } from '../../clients/hooks/useClients';
import '../styles/new-assessment.css';

type Result = {
  imc: number;
  bmr: number;
  tdee: number;
  bodyFat: number;
  leanMass: number;
  fatMass: number;
  ffmi: number;
  bodyFatLevel: string;
  targetCalories: number;
  carbs: number;
  fat: number;
  protein: number;
  cardio: string;
  notes: string[];
  trainingType: string;
  methodDetails: {
    title: string;
    items: Array<{
      label: string;
      value: string;
      description: string;
    }>;
  };
};

type SpecificData = {
  waist: number;
  neck: number;
  hip: number;
  resistance: number;
  reactance: number;
  protocol: 'jp3' | 'jp7' | 'dw4';
  biceps: number;
  triceps: number;
  subscapular: number;
  chest: number;
  midaxillary: number;
  abdominal: number;
  suprailiac: number;
  thigh: number;
};

const INITIAL_SPECIFIC: SpecificData = {
  waist: 0,
  neck: 0,
  hip: 0,
  resistance: 0,
  reactance: 0,
  protocol: 'jp3',
  biceps: 0,
  triceps: 0,
  subscapular: 0,
  chest: 0,
  midaxillary: 0,
  abdominal: 0,
  suprailiac: 0,
  thigh: 0,
};

export default function NewAssessment() {
  const { clientId } = useParams<{ clientId: string }>();
  const { addAssessment } = useAssessments();
  const { getClientById, getClientAssessments } = useClients();

  const selectedClient = clientId ? getClientById(clientId) : null;
  const clientAssessments = selectedClient ? getClientAssessments(selectedClient.id) : [];
  const lastAssessment = clientAssessments[0] ?? null;

  const [savedMessage, setSavedMessage] = useState<string>('');
  const [method, setMethod] = useState<AssessmentMethod>('navy');
  const [currentResult, setCurrentResult] = useState<Result | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [specificData, setSpecificData] = useState<SpecificData>(INITIAL_SPECIFIC);
  const [specificInputValues, setSpecificInputValues] = useState<Record<string, string>>({
    waist: '',
    neck: '',
    hip: '',
    resistance: '',
    reactance: '',
    biceps: '',
    triceps: '',
    subscapular: '',
    chest: '',
    midaxillary: '',
    abdominal: '',
    suprailiac: '',
    thigh: '',
  });

  const {
    commonData,
    commonInputValues,
    setCommonInputValues,
    setCommonData,
    assessmentNotes,
    setAssessmentNotes,
    handleCommonChange,
    loadFromAssessment,
    resetAll,
  } = useAssessmentState();

  useEffect(() => {
    setErrors({});
    setCurrentResult(null);
    setSpecificData({ ...INITIAL_SPECIFIC });

    const cleanSpecificInputs = {
      waist: '',
      neck: '',
      hip: '',
      resistance: '',
      reactance: '',
      biceps: '',
      triceps: '',
      subscapular: '',
      chest: '',
      midaxillary: '',
      abdominal: '',
      suprailiac: '',
      thigh: '',
    };
    setSpecificInputValues(cleanSpecificInputs);

    if (selectedClient && lastAssessment) {
      loadFromAssessment(lastAssessment);
    } else if (selectedClient) {
      setCommonData({
        weight: 0,
        height: 0,
        age: 0,
        gender: '',
        activityLevel: 'moderate',
        objective: 'maintenance',
      });
      setCommonInputValues({ weight: '', height: '', age: '' });
    } else {
      resetAll();
      setSpecificData({ ...INITIAL_SPECIFIC });
      setSpecificInputValues(cleanSpecificInputs);
    }
  }, [clientId]);

  function handleSaveAssessment() {
    if (!currentResult) return;
    if (!commonData.gender || !commonData.weight || !commonData.height || !commonData.age) {
      alert('Preencha todos os campos obrigatórios antes de salvar.');
      return;
    }

    const specificData_mapped: any = {};

    if (method === 'navy') {
      specificData_mapped.navy = {
        waist: specificData.waist,
        neck: specificData.neck,
        hip: commonData.gender === 'female' ? specificData.hip : undefined,
      };
    } else if (method === 'bioimpedance') {
      specificData_mapped.bioimpedance = {
        resistance: specificData.resistance,
        reactance: specificData.reactance,
      };
    } else if (method === 'skinfold') {
      specificData_mapped.skinfold = {
        protocol: specificData.protocol,
        ...Object.fromEntries(
          Object.entries(specificData).filter(([key]) =>
            [
              'biceps',
              'triceps',
              'subscapular',
              'chest',
              'midaxillary',
              'abdominal',
              'suprailiac',
              'thigh',
            ].includes(key)
          )
        ),
      };
    }

    const newAssessment = addAssessment({
      clientId: clientId || undefined,
      date: new Date().toISOString().split('T')[0],
      method,
      weight: commonData.weight,
      height: commonData.height,
      age: commonData.age,
      gender: commonData.gender as 'male' | 'female',
      ...specificData_mapped,
      results: {
        imc: currentResult.imc,
        bodyFat: currentResult.bodyFat,
        leanMass: currentResult.leanMass,
        fatMass: currentResult.fatMass,
        ffmi: currentResult.ffmi,
        bmr: currentResult.bmr,
        tdee: currentResult.tdee,
        targetCalories: currentResult.targetCalories,
        bodyFatLevel: currentResult.bodyFatLevel,
      },
      observations: assessmentNotes || undefined,
    });

    setSavedMessage(`Avaliação salva com sucesso! (${newAssessment.date})`);
    setTimeout(() => setSavedMessage(''), 5000);
  }

  function validateCommonFields(): Record<string, string> {
    const errs: Record<string, string> = {};
    const weightError = validateField('weight', commonData.weight);
    if (weightError) errs.weight = weightError;
    const heightError = validateField('height', commonData.height);
    if (heightError) errs.height = heightError;
    const ageError = validateField('age', commonData.age);
    if (ageError) errs.age = ageError;
    const genderError = validateField('gender', commonData.gender);
    if (genderError) errs.gender = genderError;
    return errs;
  }

  function validateField(field: string, value: number | string): string {
    if (field === 'gender') {
      return !value || value === '' ? EMPTY_MESSAGES.gender : '';
    }
    const numValue = value as number;
    if (!numValue || numValue === 0) {
      return EMPTY_MESSAGES[field] ?? `${field} é obrigatório`;
    }
    const ranges: Record<string, { min: number; max: number }> = {
      weight: { min: 20, max: 300 },
      height: { min: 50, max: 250 },
      age: { min: 10, max: 100 },
      waist: { min: 50, max: 200 },
      neck: { min: 20, max: 60 },
      hip: { min: 50, max: 200 },
      resistance: { min: 100, max: 1500 },
      reactance: { min: 5, max: 300 },
      biceps: { min: 1, max: 100 },
      triceps: { min: 1, max: 100 },
      subscapular: { min: 1, max: 100 },
      chest: { min: 1, max: 100 },
      midaxillary: { min: 1, max: 100 },
      abdominal: { min: 1, max: 100 },
      suprailiac: { min: 1, max: 100 },
      thigh: { min: 1, max: 100 },
    };
    const range = ranges[field];
    if (range && (numValue < range.min || numValue > range.max)) {
      return INVALID_MESSAGES[field] ?? `${field} deve ser entre ${range.min} e ${range.max}`;
    }
    return '';
  }

  function handleNavyCalculate() {
    const errs = validateCommonFields();
    const waistError = validateField('waist', specificData.waist);
    if (waistError) errs.waist = waistError;
    const neckError = validateField('neck', specificData.neck);
    if (neckError) errs.neck = neckError;
    if (commonData.gender === 'female') {
      const hipError = validateField('hip', specificData.hip);
      if (hipError) errs.hip = hipError;
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    const navyData = {
      ...commonData,
      gender: commonData.gender as 'male' | 'female',
      waist: specificData.waist,
      neck: specificData.neck,
      hip: specificData.hip,
    };
    setCurrentResult(calcNavy(navyData as NavyAssessmentInput));
  }

  function handleBioCalculate() {
    const errs = validateCommonFields();
    const resistanceError = validateField('resistance', specificData.resistance);
    if (resistanceError) errs.resistance = resistanceError;
    const reactanceError = validateField('reactance', specificData.reactance);
    if (reactanceError) errs.reactance = reactanceError;
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    const bioData = {
      ...commonData,
      gender: commonData.gender as 'male' | 'female',
      resistance: specificData.resistance,
      reactance: specificData.reactance,
    };
    setCurrentResult(calcBio(bioData as BioimpedanceInput));
  }

  function handleSkinfoldCalculate() {
    const errs = validateCommonFields();
    const skinfoldData = { ...commonData, ...specificData };
    const requiredFields = getRequiredSkinfoldFields(skinfoldData as any);
    requiredFields.forEach((field: string) => {
      const error = validateField(field, specificData[field as keyof SpecificData] as number);
      if (error) errs[field] = error;
    });
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setCurrentResult(calcSkinfold(skinfoldData));
  }

  function handleImcCalculate() {
    const errs = validateCommonFields();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setCurrentResult(calcImc());
  }

  function handleSpecificChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    if (name === 'protocol') {
      const newProtocol = value as 'jp3' | 'jp7' | 'dw4';
      const allSkinfoldFields = [
        'biceps',
        'triceps',
        'subscapular',
        'chest',
        'midaxillary',
        'abdominal',
        'suprailiac',
        'thigh',
      ];
      const nextData = { ...commonData, ...specificData, protocol: newProtocol };
      const requiredFields = getRequiredSkinfoldFields(nextData as any);
      const removedFields = allSkinfoldFields.filter((f) => !requiredFields.includes(f as any));
      setSpecificData((prev) => {
        const updated = { ...prev, protocol: newProtocol };
        removedFields.forEach((f) => {
          (updated as any)[f] = 0;
        });
        return updated;
      });
      setSpecificInputValues((prev) => {
        const updated = { ...prev };
        removedFields.forEach((f) => {
          updated[f] = '';
        });
        return updated;
      });
      setErrors((prev) => {
        const updated = { ...prev };
        removedFields.forEach((f) => {
          delete updated[f];
        });
        return updated;
      });
      return;
    }
    if (name in specificData) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
      const display = value.replace(',', '.');
      if (!/^\d*\.?\d*$/.test(display)) return;
      setSpecificInputValues((prev) => ({ ...prev, [name]: value }));
      setSpecificData((prev) => ({ ...prev, [name]: parseDecimal(value) }));
    }
  }

  function parseDecimal(value: string): number {
    const v = value.replace(',', '.');
    return v === '' || v === '.' ? 0 : Number(v);
  }

  function calcNavy(data: NavyAssessmentInput): Result {
    const bmr = calculateBMR(data);
    const tdee = calculateTDEE(data, bmr);
    const bodyFat = calculateBodyFat(data);
    const leanMass = calculateLeanMass(data.weight, bodyFat);
    const fatMass = calculateFatMass(data.weight, bodyFat);
    const ffmi = calculateFFMI(leanMass, data.height);
    const imc = calculateIMC(data);
    const bodyFatLevel = interpretBodyFat(data.gender, bodyFat);
    const recommendation = generateRecommendation(data, tdee, bodyFat);
    const navyBase =
      data.gender === 'male' ? data.waist - data.neck : data.waist + data.hip - data.neck;
    return {
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
            value: `${navyBase.toFixed(1)} cm`,
            description: 'Valor principal usado no cálculo',
          },
        ],
      },
    };
  }

  function calcBio(data: BioimpedanceInput): Result {
    const bioAsUser = { ...data, waist: 0, neck: 0, hip: 0 };
    const bodyFat = calculateBodyFatBio(data);
    const leanMass = calculateLeanMass(data.weight, bodyFat);
    const fatMass = calculateFatMass(data.weight, bodyFat);
    const imc = calculateIMC(bioAsUser);
    const bmr = calculateBMR(bioAsUser);
    const tdee = calculateTDEE(bioAsUser, bmr);
    const ffmi = calculateFFMI(leanMass, data.height);
    const bodyFatLevel = interpretBodyFat(data.gender, bodyFat);
    const recommendation = generateRecommendation(bioAsUser, tdee, bodyFat);
    const impedance = calculateBioImpedance(data);
    const phaseAngle = calculatePhaseAngle(data);
    const tbw = calculateTBW(data);
    return {
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
    };
  }

  function calcSkinfold(data: any): Result {
    const userInput = { ...commonData, waist: 0, neck: 0, hip: 0 };
    const bodyFat = calculateBodyFatSkinfold(data);
    const leanMass = calculateLeanMass(data.weight, bodyFat);
    const fatMass = calculateFatMass(data.weight, bodyFat);
    const imc = calculateIMC(userInput);
    const bmr = calculateBMR(userInput);
    const tdee = calculateTDEE(userInput, bmr);
    const ffmi = calculateFFMI(leanMass, data.height);
    const bodyFatLevel = interpretBodyFat(data.gender, bodyFat);
    const recommendation = generateRecommendation(userInput, tdee, bodyFat);
    const sum = calculateSkinfoldSum(data);
    const density = calculateSkinfoldDensity(data);
    const protocolLabel =
      data.protocol === 'jp3'
        ? 'Jackson-Pollock 3 dobras'
        : data.protocol === 'jp7'
          ? 'Jackson-Pollock 7 dobras'
          : 'Durnin-Womersley 4 dobras';
    return {
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
        title: 'Detalhes das dobras',
        items: [
          {
            label: 'Protocolo',
            value: protocolLabel,
            description: 'Método utilizado para cálculo das dobras',
          },
          {
            label: 'Soma das dobras',
            value: `${sum.toFixed(1)} mm`,
            description: 'Soma total das dobras medidas',
          },
          {
            label: 'Densidade corporal',
            value: density.toFixed(4),
            description: 'Estimativa da densidade corporal',
          },
        ],
      },
    };
  }

  function calcImc(): Result {
    const data: NavyAssessmentInput = { ...commonData, waist: 0, neck: 0, hip: 0 };
    const bmr = calculateBMR(data);
    const tdee = calculateTDEE(data, bmr);
    const imc = calculateIMC(data);
    const recommendation = generateRecommendation(data, tdee, 0);
    return {
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
        ],
      },
    };
  }

  const getNavyInputValues = () => ({
    ...commonInputValues,
    waist: specificInputValues.waist || '',
    neck: specificInputValues.neck || '',
    hip: specificInputValues.hip || '',
  });
  const getBioInputValues = () => ({
    ...commonInputValues,
    resistance: specificInputValues.resistance || '',
    reactance: specificInputValues.reactance || '',
  });
  const getSkinfoldInputValues = () => ({
    ...commonInputValues,
    biceps: specificInputValues.biceps || '',
    triceps: specificInputValues.triceps || '',
    subscapular: specificInputValues.subscapular || '',
    chest: specificInputValues.chest || '',
    midaxillary: specificInputValues.midaxillary || '',
    abdominal: specificInputValues.abdominal || '',
    suprailiac: specificInputValues.suprailiac || '',
    thigh: specificInputValues.thigh || '',
  });
  const getImcInputValues = () => ({ ...commonInputValues, waist: '', neck: '', hip: '' });

  function handleReset() {
    setErrors({});
    setCurrentResult(null);
    setSpecificData(INITIAL_SPECIFIC);
    setSpecificInputValues({
      waist: '',
      neck: '',
      hip: '',
      resistance: '',
      reactance: '',
      biceps: '',
      triceps: '',
      subscapular: '',
      chest: '',
      midaxillary: '',
      abdominal: '',
      suprailiac: '',
      thigh: '',
    });
    resetAll();
  }

  const resetSkinfoldFields = (gender: 'male' | 'female', protocol: string) => {
    if (protocol !== 'jp3') return;
    const fieldsToReset = PROTOCOL_FIELDS.jp3.toReset[gender];
    setSpecificData((prev) => {
      const updated = { ...prev };
      fieldsToReset.forEach((field) => (updated[field] = 0));
      return updated;
    });
    setSpecificInputValues((prev) => {
      const updated = { ...prev };
      fieldsToReset.forEach((field) => (updated[field] = ''));
      return updated;
    });
    setErrors((prev) => {
      const updated = { ...prev };
      fieldsToReset.forEach((field) => delete updated[field]);
      return updated;
    });
  };

  const handleNavyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: '' }));
    if (name === 'gender') {
      handleCommonChange(e);
      if (value === 'male') {
        setSpecificData((prev) => ({ ...prev, hip: 0 }));
        setSpecificInputValues((prev) => ({ ...prev, hip: '' }));
        setErrors((prev) => {
          const u = { ...prev };
          delete u.hip;
          return u;
        });
      }
      return;
    }
    if (['waist', 'neck', 'hip'].includes(name)) handleSpecificChange(e);
    else handleCommonChange(e);
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    if (['resistance', 'reactance'].includes(e.target.name)) handleSpecificChange(e);
    else handleCommonChange(e);
  };

  const handleSkinfoldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: '' }));
    if (name === 'gender') {
      handleCommonChange(e);
      resetSkinfoldFields(value as 'male' | 'female', specificData.protocol);
      return;
    }
    const isSkinfoldField = [
      'protocol',
      'biceps',
      'triceps',
      'subscapular',
      'chest',
      'midaxillary',
      'abdominal',
      'suprailiac',
      'thigh',
    ].includes(name);
    if (isSkinfoldField) handleSpecificChange(e);
    else handleCommonChange(e);
  };

  return (
    <div className="container">
      {/* ── Page header ── */}
      <div className="assessment-page-header">
        <h1>Nova Avaliação</h1>
        <div className="assessment-header-controls">
          <div className="method-selector-inline">
            <InputField
              type="select"
              label="Método"
              name="method"
              value={method}
              options={methodOptions}
              onChange={(e) => {
                setMethod(e.target.value as AssessmentMethod);
                setCurrentResult(null);
                setErrors({});
              }}
            />
          </div>
          <button className="btn-secondary btn-reset" onClick={handleReset}>
            Resetar
          </button>
        </div>
      </div>

      {selectedClient && <ClientContextBar client={selectedClient} />}

      {/* ── Main card ── */}
      <div className="main-calculator-card">
        <div className="calculator-layout">
          {/* Left: form */}
          <div className="left-panel">
            {method === 'navy' && (
              <NavyCalculator
                data={{
                  ...commonData,
                  waist: specificData.waist,
                  neck: specificData.neck,
                  hip: specificData.hip,
                }}
                inputValues={getNavyInputValues()}
                errors={errors}
                handleChange={handleNavyChange}
                handleCalculate={handleNavyCalculate}
                handleReset={handleReset}
              />
            )}
            {method === 'bioimpedance' && (
              <BioimpedanceCalculator
                data={
                  {
                    ...commonData,
                    resistance: specificData.resistance,
                    reactance: specificData.reactance,
                  } as BioimpedanceInput
                }
                inputValues={getBioInputValues()}
                errors={errors}
                handleChange={handleBioChange}
                handleCalculate={handleBioCalculate}
                handleReset={handleReset}
              />
            )}
            {method === 'skinfold' && (
              <SkinfoldCalculator
                data={{ ...commonData, ...specificData }}
                inputValues={getSkinfoldInputValues()}
                errors={errors}
                handleChange={handleSkinfoldChange}
                handleCalculate={handleSkinfoldCalculate}
                handleReset={handleReset}
              />
            )}
            {method === 'imc' && (
              <ImcCalculator
                data={{ ...commonData, waist: 0, neck: 0, hip: 0 } as NavyAssessmentInput}
                inputValues={getImcInputValues()}
                errors={errors}
                handleChange={(e) => {
                  setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
                  handleCommonChange(e);
                }}
                handleCalculate={handleImcCalculate}
                handleReset={handleReset}
              />
            )}
          </div>

          {/* Right: results */}
          <ResultCards result={currentResult} method={method} />
        </div>

        {/* ── Card footer: notes + save ── */}
        <div className="assessment-footer">
          <div className="assessment-notes">
            <label className="field-label">Observações</label>
            <textarea
              value={assessmentNotes}
              onChange={(e) => setAssessmentNotes(e.target.value)}
              placeholder="Observações sobre a avaliação (opcional)"
              rows={3}
              maxLength={500}
            />
            <small className="notes-counter">{assessmentNotes.length}/500</small>
          </div>

          <div className="assessment-save-area">
            {savedMessage && <div className="save-success-message">{savedMessage}</div>}
            <div className="save-btn-wrapper">
              <button onClick={handleSaveAssessment} disabled={!currentResult} className="btn-save">
                Salvar Avaliação
              </button>
            </div>
            {clientId && <p className="save-hint">Será vinculada ao cliente atual</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
