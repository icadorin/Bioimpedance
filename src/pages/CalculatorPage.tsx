import {
  calculateIMC,
  calculateBMR,
  calculateTDEE,
  calculateBodyFat,
  calculateLeanMass,
  calculateFatMass,
  calculateFFMI,
} from '../utils/calculations';

import type { UserInput, Gender } from '../types';
import { useState } from 'react';

interface Result {
  imc: number;
  bmr: number;
  tdee: number;
  bodyFat: number;
  leanMass: number;
  fatMass: number;
  ffmi: number;
}

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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;

    setData((prev: UserInput) => {
      const key = name as keyof UserInput;

      // campos que são string
      if (key === 'gender' || key === 'activityLevel' || key === 'objective') {
        return { ...prev, [key]: value };
      }

      // campos numéricos
      return { ...prev, [key]: Number(value) };
    });
  }

  function handleCalculate() {
    const imc = calculateIMC(data);
    const bmr = calculateBMR(data);
    const tdee = calculateTDEE(data, bmr);
    const bodyFat = calculateBodyFat(data);

    const leanMass = calculateLeanMass(data.weight, bodyFat);
    const fatMass = calculateFatMass(data.weight, bodyFat);
    const ffmi = calculateFFMI(leanMass, data.height);

    setResult({
      imc,
      bmr,
      tdee,
      bodyFat,
      leanMass,
      fatMass,
      ffmi,
    });
  }

  return (
    <div className="container">
      <h1>Calculadora Física</h1>

      <div className="form">
        {/* Dados básicos */}
        <h2>Dados básicos</h2>

        <input name="weight" placeholder="Peso (kg)" onChange={handleChange} />
        <input name="height" placeholder="Altura (m)" onChange={handleChange} />
        <input name="age" placeholder="Idade" onChange={handleChange} />

        <select name="gender" onChange={handleChange}>
          <option value="male">Masculino</option>
          <option value="female">Feminino</option>
        </select>

        {/* Atividade */}
        <h2>Nível de atividade</h2>

        <select name="activityLevel" onChange={handleChange}>
          <option value="sedentary">Sedentário (não treina)</option>
          <option value="light">Leve (1–3x por semana)</option>
          <option value="moderate">Moderado (3–5x por semana)</option>
          <option value="active">Ativo (quase todo dia)</option>
          <option value="very_active">Muito ativo</option>
        </select>

        {/* Objetivo */}
        <h2>Objetivo</h2>

        <select name="objective" onChange={handleChange}>
          <option value="cutting">Cutting (perder gordura)</option>
          <option value="maintenance">Manutenção</option>
          <option value="bulking">Bulking (ganhar massa)</option>
        </select>

        {/* Medidas corporais */}
        <h2>Medidas corporais</h2>

        <input name="waist" placeholder="Cintura (cm)" onChange={handleChange} />
        <input name="neck" placeholder="Pescoço (cm)" onChange={handleChange} />

        {data.gender === 'female' && (
          <input name="hip" placeholder="Quadril (cm)" onChange={handleChange} />
        )}

        <button onClick={handleCalculate}>Calcular</button>
      </div>

      {/* Resultados */}
      {result && (
        <div style={{ marginTop: 20 }}>
          <h2>Resultados</h2>

          <p>IMC: {result.imc.toFixed(2)}</p>
          <p>TMB: {result.bmr.toFixed(2)}</p>
          <p>TDEE: {result.tdee.toFixed(2)}</p>

          <p>% Gordura: {result.bodyFat.toFixed(2)}%</p>

          <p>Massa magra: {result.leanMass.toFixed(2)} kg</p>
          <p>Massa gorda: {result.fatMass.toFixed(2)} kg</p>

          <p>FFMI: {result.ffmi.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}
