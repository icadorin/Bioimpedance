import type { BioimpedanceInput } from '../../types/bioimpedance.types';
import type { BioimpedanceInputValues } from '../../types/input-values.types';
import { InputField } from '../../../../components/shared/InputField';
import { BasicFields } from '../BasicFields';

interface BioimpedanceCalculatorProps {
  data: BioimpedanceInput;
  inputValues: BioimpedanceInputValues;
  errors: Partial<Record<keyof BioimpedanceInput, string>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleCalculate: () => void;
  handleReset: () => void;
}

export default function BioimpedanceCalculator({
  data,
  inputValues,
  errors,
  handleChange,
  handleCalculate,
}: BioimpedanceCalculatorProps) {
  return (
    <div className="form">
      <BasicFields data={data} inputValues={inputValues} errors={errors} onChange={handleChange} />

      <h2>Dados da bioimpedância</h2>
      <div className="form-grid">
        <InputField
          label="Resistência"
          name="resistance"
          value={inputValues.resistance}
          error={errors.resistance}
          placeholder="ex: 520"
          unit="Ω"
          inputMode="decimal"
          maxLength={6}
          onChange={handleChange}
        />
        <InputField
          label="Reactância"
          name="reactance"
          value={inputValues.reactance}
          error={errors.reactance}
          placeholder="ex: 65"
          unit="Ω"
          inputMode="decimal"
          maxLength={5}
          onChange={handleChange}
        />
      </div>

      <div className="form-actions">
        <button onClick={handleCalculate}>Calcular</button>
      </div>
    </div>
  );
}
