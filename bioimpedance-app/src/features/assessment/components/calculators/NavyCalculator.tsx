import type { ChangeEvent } from 'react';
import type { NavyAssessmentInput } from '../../types/assessment-input.types';
import type { NavyInputValues } from '../../types/input-values.types';
import { InputField } from '../../../../components/shared/InputField';
import { BasicFields } from '../BasicFields';

interface NavyCalculatorProps {
  data: NavyAssessmentInput;
  inputValues: NavyInputValues;
  errors: Partial<Record<keyof NavyAssessmentInput, string>>;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleCalculate: () => void;
  handleReset: () => void;
}

export default function NavyCalculator({
  data,
  inputValues,
  errors,
  handleChange,
  handleCalculate,
}: NavyCalculatorProps) {
  return (
    <div className="form">
      <BasicFields data={data} inputValues={inputValues} errors={errors} onChange={handleChange} />

      <h2>Medidas corporais</h2>
      <div className="form-grid">
        <InputField
          label="Cintura"
          name="waist"
          value={inputValues.waist}
          error={errors.waist}
          placeholder="ex: 85.5"
          unit="cm"
          inputMode="decimal"
          maxLength={5}
          onChange={handleChange}
        />
        <InputField
          label="Pescoço"
          name="neck"
          value={inputValues.neck}
          error={errors.neck}
          placeholder="ex: 37.5"
          unit="cm"
          inputMode="decimal"
          maxLength={5}
          onChange={handleChange}
        />
        {data.gender === 'female' && (
          <InputField
            label="Quadril"
            name="hip"
            value={inputValues.hip}
            error={errors.hip}
            placeholder="ex: 95.5"
            unit="cm"
            inputMode="decimal"
            maxLength={5}
            onChange={handleChange}
          />
        )}
      </div>

      <div className="form-actions">
        <button onClick={handleCalculate}>Calcular</button>
      </div>
    </div>
  );
}
