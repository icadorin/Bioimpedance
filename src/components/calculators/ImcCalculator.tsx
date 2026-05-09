import type { UserInput } from '../../types';
import type { InputValues } from '../../types/input.types';
import type { ChangeEvent } from 'react';
import { BasicFields } from './BasicFields';

interface ImcCalculatorProps {
  data: UserInput;
  inputValues: InputValues;
  errors: Partial<Record<keyof UserInput, string>>;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleCalculate: () => void;
  handleReset: () => void;
}

export default function ImcCalculator({
  data,
  inputValues,
  errors,
  handleChange,
  handleCalculate,
  handleReset,
}: ImcCalculatorProps) {
  return (
    <div className="form">
      <BasicFields data={data} inputValues={inputValues} errors={errors} onChange={handleChange} />

      <div className="form-actions">
        <button onClick={handleCalculate}>Calcular</button>
        <button className="btn-secondary" onClick={handleReset}>
          Resetar
        </button>
      </div>
    </div>
  );
}
