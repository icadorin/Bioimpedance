import { useState } from 'react';
import { userSchema } from '../validation/userSchema';
import type { UserInput } from '../types';
import type { PhysicResult, RecommendationResult } from '../types/result.types';

import { interpretBodyFat } from '../utils/interpretation';
import { generateRecommendation } from '../utils/recommendationEngine';
import {
  calculateIMC,
  calculateBMR,
  calculateTDEE,
  calculateBodyFat,
  calculateLeanMass,
  calculateFatMass,
  calculateFFMI,
} from '../utils/calculations';

type Result = PhysicResult & RecommendationResult;

export default function CalculatorPage() {
  const [data, setData] = useState<UserInput>({
    weight: 0,
    height: 0,
    age: 0,
    gender: 'male',
    activityLevel: 'sedentary',
    objective: 'maintenance',
    waist: 0,
    neck: 0,
    hip: 0,
  });

  const [inputValues, setInputValues] = useState({
    weight: '',
    height: '',
    age: '',
    waist: '',
    neck: '',
    hip: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UserInput, string>>>({});

  const [result, setResult] = useState<Result | null>(null);

  const numericKeys: (keyof UserInput)[] = ['weight', 'height', 'age', 'waist', 'neck', 'hip'];

  const decimalKeys: (keyof UserInput)[] = ['waist', 'neck', 'hip'];

  function handleReset() {
    const initialData: UserInput = {
      weight: 0,
      height: 0,
      age: 0,
      gender: 'male',
      activityLevel: 'sedentary',
      objective: 'maintenance',
      waist: 0,
      neck: 0,
      hip: 0,
    };

    setData(initialData);
    setInputValues({
      weight: '',
      height: '',
      age: '',
      waist: '',
      neck: '',
      hip: '',
    });

    setErrors({});
    setResult(null);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    const key = name as keyof UserInput;

    setErrors((prev) => ({ ...prev, [key]: undefined }));

    if (numericKeys.includes(key)) {
      const isDecimalField = decimalKeys.includes(key);
      let displayValue = value;
      let numericValue = 0;

      if (isDecimalField) {
        displayValue = value.replace(',', '.');

        if (!/^\d*\.?\d*$/.test(displayValue)) {
          return;
        }
        numericValue = displayValue === '' ? 0 : Number(displayValue);
      } else {
        if (!/^\d*$/.test(value)) return;
        numericValue = value === '' ? 0 : Number(value);
      }

      setInputValues((prev) => ({ ...prev, [key]: value }));
      setData((prev) => ({ ...prev, [key]: numericValue }));
    } else {
      setData((prev) => ({ ...prev, [key]: value }));
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
    if (allowed.includes(e.key)) return;
    if (!/^\d$/.test(e.key)) e.preventDefault();
  }

  function friendlyMessage(field: keyof UserInput, value: number): string {
    if (value === 0) {
      const emptyMessages: Partial<Record<keyof UserInput, string>> = {
        weight: 'Informe seu peso',
        height: 'Informe sua altura',
        age: 'Informe sua idade',
        waist: 'Informe a medida da cintura',
        neck: 'Informe a medida do pescoço',
        hip: 'Informe a medida do quadril',
      };
      return emptyMessages[field] ?? 'Campo obrigatório';
    }

    const invalidMessages: Partial<Record<keyof UserInput, string>> = {
      weight: 'Peso deve ser entre 20 e 300 kg',
      height: 'Altura deve ser entre 50 e 250 cm',
      age: 'Idade deve ser entre 10 e 100 anos',
      waist: 'Cintura deve ser entre 50 e 200 cm',
      neck: 'Pescoço deve ser entre 20 e 60 cm',
      hip: 'Quadril deve ser entre 50 e 200 cm',
    };
    return invalidMessages[field] ?? 'Valor inválido';
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

    const imc = calculateIMC(validData);
    const bmr = calculateBMR(validData);
    const tdee = calculateTDEE(validData, bmr);
    const bodyFat = calculateBodyFat(validData);

    const leanMass = calculateLeanMass(validData.weight, bodyFat);
    const fatMass = calculateFatMass(validData.weight, bodyFat);
    const ffmi = calculateFFMI(leanMass, validData.height);

    const recommendation = generateRecommendation(validData, tdee, bodyFat);
    const bodyFatLevel = interpretBodyFat(validData.gender, bodyFat);

    setResult({
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
    });
  }

  return (
    <div className="container">
      <h1>Calculadora Física</h1>

      {/* FORM */}
      <div className="calculator-layout">
        <div className="form">
          <h2>Dados básicos</h2>

          <label className="field-label">Peso</label>
          <div className="input-wrapper">
            <input
              name="weight"
              value={data.weight || ''}
              className={errors.weight ? 'error' : ''}
              placeholder="Peso"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              inputMode="numeric"
              maxLength={3}
            />
            <span className="input-suffix">kg</span>
          </div>
          {errors.weight && <small style={{ color: '#ef4444' }}>{errors.weight}</small>}

          <label className="field-label">Altura</label>
          <div className="input-wrapper">
            <input
              name="height"
              value={data.height || ''}
              className={errors.height ? 'error' : ''}
              placeholder="Altura"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              inputMode="numeric"
              maxLength={3}
            />
            <span className="input-suffix">cm</span>
          </div>
          {errors.height && <small style={{ color: '#ef4444' }}>{errors.height}</small>}

          <label className="field-label">Idade</label>
          <div className="input-wrapper">
            <input
              name="age"
              value={data.age || ''}
              className={errors.age ? 'error' : ''}
              placeholder="Idade"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              inputMode="numeric"
              maxLength={3}
            />
            <span className="input-suffix">anos</span>
          </div>
          {errors.age && <small style={{ color: '#ef4444' }}>{errors.age}</small>}

          <label className="field-label">Sexo</label>
          <select name="gender" onChange={handleChange}>
            <option value="male">Masculino</option>
            <option value="female">Feminino</option>
          </select>

          <h2>Nível de atividade</h2>

          <select name="activityLevel" onChange={handleChange}>
            <option value="sedentary">Sedentário</option>
            <option value="light">Leve</option>
            <option value="moderate">Moderado</option>
            <option value="active">Ativo</option>
            <option value="very_active">Muito ativo</option>
          </select>

          <h2>Objetivo</h2>

          <select name="objective" onChange={handleChange}>
            <option value="maintenance">Manutenção</option>
            <option value="cutting">Cutting</option>
            <option value="bulking">Bulking</option>
          </select>

          <h2>Medidas corporais</h2>

          <label className="field-label">Cintura</label>
          <div className="input-wrapper">
            <input
              name="waist"
              value={inputValues.waist}
              maxLength={5}
              className={errors.waist ? 'error' : ''}
              placeholder="Cintura (cm) ex: 85.5"
              onChange={handleChange}
              autoComplete="off"
              inputMode="decimal"
            />
            <span className="input-suffix">cm</span>
          </div>
          {errors.waist && <small style={{ color: '#ef4444' }}>{errors.waist}</small>}

          <label className="field-label">Pescoço</label>
          <div className="input-wrapper">
            <input
              name="neck"
              value={inputValues.neck}
              maxLength={5}
              className={errors.neck ? 'error' : ''}
              placeholder="Pescoço (cm) ex: 37.5"
              onChange={handleChange}
              autoComplete="off"
              inputMode="decimal"
            />
            <span className="input-suffix">cm</span>
          </div>
          {errors.neck && <small style={{ color: '#ef4444' }}>{errors.neck}</small>}

          {data.gender === 'female' && (
            <>
              <label className="field-label">Quadril</label>
              <div className="input-wrapper">
                <input
                  name="hip"
                  value={inputValues.hip}
                  maxLength={5}
                  className={errors.hip ? 'error' : ''}
                  placeholder="Quadril (cm) ex: 95.5"
                  onChange={handleChange}
                  autoComplete="off"
                  inputMode="decimal"
                />
                <span className="input-suffix">cm</span>
              </div>
              {errors.hip && <small style={{ color: '#ef4444' }}>{errors.hip}</small>}
            </>
          )}

          <div className="form-actions">
            <button onClick={handleCalculate}>Calcular</button>
            <button className="btn-secondary" onClick={handleReset}>
              Resetar
            </button>
          </div>
        </div>

        {/* RESULTADOS */}
        {
          <div className="results">
            <div className="results-section">
              <h2>Composição corporal</h2>
              <div className="dashboard">
                <div className="card card--highlight">
                  <h3>% Gordura</h3>
                  <div className="value">
                    {result?.bodyFat ? `${result.bodyFat.toFixed(1)}%` : '—'}
                  </div>
                  {(result?.bodyFat ?? 0) > 0 && <small>{result?.bodyFatLevel}</small>}
                </div>
                <div className="card">
                  <h3>IMC</h3>
                  <div className="value">{result?.imc?.toFixed(1) ?? '—'}</div>
                </div>
                <div className="card">
                  <h3>FFMI</h3>
                  <div className="value">{result?.ffmi ? result.ffmi.toFixed(1) : '—'}</div>
                </div>
                <div className="card">
                  <h3>Massa magra</h3>
                  <div className="value">
                    {result?.leanMass ? (
                      <>
                        {result.leanMass.toFixed(1)}
                        <span className="unit"> kg</span>
                      </>
                    ) : (
                      '—'
                    )}
                  </div>
                </div>
                <div className="card">
                  <h3>Massa gorda</h3>
                  <div className="value">
                    {result?.fatMass ? (
                      <>
                        {result.fatMass.toFixed(1)}
                        <span className="unit"> kg</span>
                      </>
                    ) : (
                      '—'
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="results-section">
              <h2>Energia e nutrição</h2>
              <div className="dashboard">
                <div className="card card--highlight">
                  <h3>Calorias alvo</h3>
                  <div className="value">
                    {result?.targetCalories ? (
                      <>
                        {result.targetCalories.toLocaleString('pt-BR', {
                          maximumFractionDigits: 0,
                        })}
                        <span className="unit"> kcal</span>
                      </>
                    ) : (
                      '—'
                    )}
                  </div>
                </div>
                <div className="card">
                  <h3>TMB</h3>
                  <div className="value">
                    {result?.bmr ? (
                      <>
                        {result.bmr.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                        <span className="unit"> kcal</span>
                      </>
                    ) : (
                      '—'
                    )}
                  </div>
                </div>
                <div className="card">
                  <h3>TDEE</h3>
                  <div className="value">
                    {result?.tdee ? (
                      <>
                        {result.tdee.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                        <span className="unit"> kcal</span>
                      </>
                    ) : (
                      '—'
                    )}
                  </div>
                </div>
                <div className="card">
                  <h3>Proteína</h3>
                  <div className="value">
                    {result?.protein ? (
                      <>
                        {result.protein.toFixed(0)}
                        <span className="unit"> g</span>
                      </>
                    ) : (
                      '—'
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  );
}
