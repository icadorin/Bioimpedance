import type { ChangeEvent } from 'react';
import type { NavyAssessmentInput } from '../../types/assessment-input.types';
import type { NavyInputValues } from '../../types/input-values.types';
import { BasicFields } from '../BasicFields';

interface ImcCalculatorProps {
  data: NavyAssessmentInput;
  inputValues: NavyInputValues;
  errors: Partial<Record<keyof NavyAssessmentInput, string>>;
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
