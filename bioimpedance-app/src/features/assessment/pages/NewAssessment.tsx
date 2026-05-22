import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, type CalculationResult } from '../../../services/api';
import { InputField } from '../../../components/shared/InputField';
import type { NavyAssessmentInput } from '../types/assessment-input.types';
import type { Assessment, AssessmentMethod } from '../types/assessment.types';
import type { BioimpedanceInput } from '../types/bioimpedance.types';
import type { SkinfoldInput, SkinfoldMeasurementKey } from '../types/skinfold.types';
import { methodOptions } from '../config/selectOptions';
import { PROTOCOL_FIELDS } from '../constants/protocolFields';
import { EMPTY_MESSAGES, INVALID_MESSAGES } from '../constants/validationMessages';
import { useAssessmentState } from '../hooks/useAssessmentState';
import { getRequiredSkinfoldFields } from '../utils/calculationsSkin';
import BioimpedanceCalculator from '../components/calculators/BioimpedanceCalculator';
import ImcCalculator from '../components/calculators/ImcCalculator';
import NavyCalculator from '../components/calculators/NavyCalculator';
import SkinfoldCalculator from '../components/calculators/SkinfoldCalculator';
import ResultCards from '../components/ResultCards';
import { useBilling } from '../../billing/hooks/useBilling';
import ClientContextBar from '../../clients/components/client-profile/ClientContextBar';
import { useClients } from '../../clients/hooks/useClients';
import '../styles/new-assessment.css';

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

function createEmptySpecificInputs() {
  return {
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
}

function parseDecimal(value: string): number {
  const normalized = value.replace(',', '.');
  return normalized === '' || normalized === '.' ? 0 : Number(normalized);
}

export default function NewAssessment() {
  const { clientId } = useParams<{ clientId: string }>();
  const { getClientById } = useClients();
  const { hasFeature } = useBilling();
  const canSaveHistory = hasFeature('history');

  const selectedClient = clientId ? getClientById(clientId) : null;
  const [clientAssessments, setClientAssessments] = useState<Assessment[]>([]);
  const lastAssessment = clientAssessments[0] ?? null;

  const [savedMessage, setSavedMessage] = useState('');
  const [method, setMethod] = useState<AssessmentMethod>('navy');
  const [currentResult, setCurrentResult] = useState<CalculationResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [specificData, setSpecificData] = useState<SpecificData>(INITIAL_SPECIFIC);
  const [specificInputValues, setSpecificInputValues] = useState<Record<string, string>>(
    createEmptySpecificInputs()
  );

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
    let active = true;

    async function loadClientAssessments() {
      if (!clientId) {
        setClientAssessments([]);
        return;
      }

      try {
        const assessments = await api.getClientAssessments(clientId);
        if (active) setClientAssessments(assessments);
      } catch (error) {
        console.error('Erro ao carregar avaliacoes do cliente:', error);
        if (active) setClientAssessments([]);
      }
    }

    loadClientAssessments();

    return () => {
      active = false;
    };
  }, [clientId]);

  useEffect(() => {
    const cleanSpecificInputs = createEmptySpecificInputs();

    setErrors({});
    setCurrentResult(null);
    setSpecificData({ ...INITIAL_SPECIFIC });
    setSpecificInputValues(cleanSpecificInputs);

    if (selectedClient && lastAssessment) {
      loadFromAssessment(lastAssessment);
      return;
    }

    if (selectedClient) {
      setCommonData({
        weight: 0,
        height: 0,
        age: 0,
        gender: '',
        activityLevel: 'moderate',
        objective: 'maintenance',
      });
      setCommonInputValues({ weight: '', height: '', age: '' });
      setAssessmentNotes('');
      return;
    }

    resetAll();
  }, [clientId, lastAssessment?.id, selectedClient?.id]);

  function buildAssessmentPayload() {
    return {
      clientId: clientId || undefined,
      date: new Date().toISOString().split('T')[0],
      method,
      weight: commonData.weight,
      height: commonData.height,
      age: commonData.age,
      gender: commonData.gender as 'male' | 'female',
      activityLevel: commonData.activityLevel,
      objective: commonData.objective,
      waist: specificData.waist,
      neck: specificData.neck,
      hip: specificData.hip,
      resistance: specificData.resistance,
      reactance: specificData.reactance,
      protocol: specificData.protocol,
      biceps: specificData.biceps,
      chest: specificData.chest,
      midaxillary: specificData.midaxillary,
      triceps: specificData.triceps,
      subscapular: specificData.subscapular,
      abdominal: specificData.abdominal,
      suprailiac: specificData.suprailiac,
      thigh: specificData.thigh,
      observations: assessmentNotes || undefined,
    };
  }

  async function handleSaveAssessment() {
    if (!canSaveHistory) {
      alert('Salvar histórico está disponível nos planos Pro e Studio.');
      return;
    }

    if (!currentResult) {
      alert('Faça o cálculo antes de salvar.');
      return;
    }

    setIsSaving(true);

    try {
      const savedAssessment = await api.saveAssessment(buildAssessmentPayload());

      if (clientId) {
        setClientAssessments((prev) => [
          savedAssessment,
          ...prev.filter((assessment) => assessment.id !== savedAssessment.id),
        ]);
      }

      setSavedMessage('Avaliação salva com sucesso!');
      setTimeout(() => setSavedMessage(''), 4000);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Tente novamente';
      alert(`Erro ao salvar: ${message}`);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCalculate() {
    setIsCalculating(true);
    setErrors({});

    try {
      const result = await api.calculate(buildAssessmentPayload());
      setCurrentResult(result);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Tente novamente';
      alert(`Erro ao calcular: ${message}`);
    } finally {
      setIsCalculating(false);
    }
  }

  function validateCommonFields(): Record<string, string> {
    const nextErrors: Record<string, string> = {};
    const weightError = validateField('weight', commonData.weight);
    if (weightError) nextErrors.weight = weightError;
    const heightError = validateField('height', commonData.height);
    if (heightError) nextErrors.height = heightError;
    const ageError = validateField('age', commonData.age);
    if (ageError) nextErrors.age = ageError;
    const genderError = validateField('gender', commonData.gender);
    if (genderError) nextErrors.gender = genderError;
    return nextErrors;
  }

  function validateField(field: string, value: number | string): string {
    if (field === 'gender') {
      return !value || value === '' ? EMPTY_MESSAGES.gender : '';
    }

    const numericValue = value as number;
    if (!numericValue || numericValue === 0) {
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
    if (range && (numericValue < range.min || numericValue > range.max)) {
      return INVALID_MESSAGES[field] ?? `${field} deve ser entre ${range.min} e ${range.max}`;
    }

    return '';
  }

  async function calculateIfValid(nextErrors: Record<string, string>) {
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    await handleCalculate();
  }

  async function handleNavyCalculate() {
    const nextErrors = validateCommonFields();
    const waistError = validateField('waist', specificData.waist);
    if (waistError) nextErrors.waist = waistError;
    const neckError = validateField('neck', specificData.neck);
    if (neckError) nextErrors.neck = neckError;

    if (commonData.gender === 'female') {
      const hipError = validateField('hip', specificData.hip);
      if (hipError) nextErrors.hip = hipError;
    }

    await calculateIfValid(nextErrors);
  }

  async function handleBioCalculate() {
    const nextErrors = validateCommonFields();
    const resistanceError = validateField('resistance', specificData.resistance);
    if (resistanceError) nextErrors.resistance = resistanceError;
    const reactanceError = validateField('reactance', specificData.reactance);
    if (reactanceError) nextErrors.reactance = reactanceError;
    await calculateIfValid(nextErrors);
  }

  async function handleSkinfoldCalculate() {
    const nextErrors = validateCommonFields();
    const skinfoldData: SkinfoldInput = { ...commonData, ...specificData };
    const requiredFields = getRequiredSkinfoldFields(skinfoldData);

    requiredFields.forEach((field) => {
      const error = validateField(field, specificData[field]);
      if (error) nextErrors[field] = error;
    });

    await calculateIfValid(nextErrors);
  }

  async function handleImcCalculate() {
    await calculateIfValid(validateCommonFields());
  }

  function handleSpecificChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;

    if (name === 'protocol') {
      const newProtocol = value as SpecificData['protocol'];
      const allSkinfoldFields: SkinfoldMeasurementKey[] = [
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
      const requiredFields = getRequiredSkinfoldFields(nextData);
      const removedFields = allSkinfoldFields.filter((field) => !requiredFields.includes(field));

      setSpecificData((prev) => {
        const updated = { ...prev, protocol: newProtocol };
        removedFields.forEach((field) => {
          updated[field] = 0;
        });
        return updated;
      });

      setSpecificInputValues((prev) => {
        const updated = { ...prev };
        removedFields.forEach((field) => {
          updated[field] = '';
        });
        return updated;
      });

      setErrors((prev) => {
        const updated = { ...prev };
        removedFields.forEach((field) => {
          delete updated[field];
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
    setSpecificData({ ...INITIAL_SPECIFIC });
    setSpecificInputValues(createEmptySpecificInputs());
    resetAll();
  }

  function resetSkinfoldFields(gender: 'male' | 'female', protocol: string) {
    if (protocol !== 'jp3') return;
    const fieldsToReset = PROTOCOL_FIELDS.jp3.toReset[gender];

    setSpecificData((prev) => {
      const updated = { ...prev };
      fieldsToReset.forEach((field) => {
        updated[field] = 0;
      });
      return updated;
    });

    setSpecificInputValues((prev) => {
      const updated = { ...prev };
      fieldsToReset.forEach((field) => {
        updated[field] = '';
      });
      return updated;
    });

    setErrors((prev) => {
      const updated = { ...prev };
      fieldsToReset.forEach((field) => delete updated[field]);
      return updated;
    });
  }

  const handleNavyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: '' }));

    if (name === 'gender') {
      handleCommonChange(e);

      if (value === 'male') {
        setSpecificData((prev) => ({ ...prev, hip: 0 }));
        setSpecificInputValues((prev) => ({ ...prev, hip: '' }));
        setErrors((prev) => {
          const updated = { ...prev };
          delete updated.hip;
          return updated;
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

      <div className="main-calculator-card">
        <div className="calculator-layout">
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

          <ResultCards result={currentResult} method={method} />
        </div>

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
              <button
                onClick={handleSaveAssessment}
                disabled={!canSaveHistory || !currentResult || isCalculating || isSaving}
                className="btn-save"
              >
                {isSaving ? 'Salvando...' : isCalculating ? 'Calculando...' : 'Salvar Avaliação'}
              </button>
            </div>
            {!canSaveHistory ? (
              <p className="save-hint">Planos Pro e Studio liberam histórico e clientes.</p>
            ) : (
              clientId && <p className="save-hint">Será vinculada ao cliente atual</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
