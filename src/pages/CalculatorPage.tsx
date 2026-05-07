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

  const [result, setResult] = useState<Result | null>(null);

  const numericKeys: (keyof UserInput)[] = ['weight', 'height', 'age', 'waist', 'neck', 'hip'];

  function isNumericKey(key: keyof UserInput) {
    return numericKeys.includes(key);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;

    const key = name as keyof UserInput;

    setData((prev) => ({
      ...prev,
      [key]: isNumericKey(key) ? (value === '' ? 0 : Number(value)) : value,
    }));
  }

  function handleCalculate() {
    const parsed = userSchema.safeParse(data);

    if (!parsed.success) {
      alert('Preencha os campos corretamente antes de calcular');
      return;
    }

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
      <div className="form">
        <h2>Dados básicos</h2>

        <input name="weight" placeholder="Peso (kg)" onChange={handleChange} />
        <input name="height" placeholder="Altura (cm)" onChange={handleChange} />
        <input name="age" placeholder="Idade" onChange={handleChange} />

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

        <input name="waist" placeholder="Cintura (cm)" onChange={handleChange} />
        <input name="neck" placeholder="Pescoço (cm)" onChange={handleChange} />

        {data.gender === 'female' && (
          <input name="hip" placeholder="Quadril (cm)" onChange={handleChange} />
        )}

        <button onClick={handleCalculate}>Calcular</button>
      </div>

      {/* RESULTADOS */}
      {result && (
        <div className="dashboard">
          <div className="card">
            <h3>IMC</h3>
            <div className="value">{result.imc?.toFixed(2)}</div>
          </div>

          <div className="card">
            <h3>FFMI</h3>
            <div className="value">{result.ffmi ? result.ffmi.toFixed(2) : '—'}</div>
          </div>

          <div className="card">
            <h3>% Gordura</h3>
            <div className="value">
              {result.bodyFat ? `${result.bodyFat.toFixed(2)}%` : 'Sem dados'}
            </div>
            {result.bodyFat > 0 && <small>{result.bodyFatLevel}</small>}
          </div>

          <div className="card">
            <h3>TMB</h3>
            <div className="value">{result.bmr?.toFixed(0)} kcal</div>
          </div>

          <div className="card">
            <h3>TDEE</h3>
            <div className="value">{result.tdee?.toFixed(0)} kcal</div>
          </div>

          <div className="card">
            <h3>Calorias alvo</h3>
            <div className="value">{result.targetCalories?.toFixed(0)} kcal</div>
          </div>

          <div className="card">
            <h3>Proteína</h3>
            <div className="value">{result.protein?.toFixed(0)} g</div>
          </div>

          <div className="card">
            <h3>Massa magra</h3>
            <div className="value">{result.leanMass?.toFixed(1)} kg</div>
          </div>

          <div className="card">
            <h3>Massa gorda</h3>
            <div className="value">{result.fatMass?.toFixed(1)} kg</div>
          </div>
        </div>
      )}
    </div>
  );
}
