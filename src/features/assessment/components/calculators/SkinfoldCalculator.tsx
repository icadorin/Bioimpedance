import type { SkinfoldInput, SkinfoldMeasurementKey } from '../../types/skinfold.types';
import type { SkinfoldInputValues } from '../../types/input-values.types';
import { getRequiredSkinfoldFields } from '../../utils/calculationsSkin';
import { InputField } from '../../../../components/shared/InputField';
import { skinfoldProtocolOptions } from '../../config/selectOptions';
import { BasicFields } from '../BasicFields';

type SkinfoldField = {
  name: SkinfoldMeasurementKey;
  label: string;
  placeholder: string;
};

const SKINFOLD_FIELDS: Record<SkinfoldMeasurementKey, SkinfoldField> = {
  biceps: { name: 'biceps', label: 'Bíceps', placeholder: 'ex: 10' },
  chest: { name: 'chest', label: 'Peitoral', placeholder: 'ex: 12' },
  midaxillary: { name: 'midaxillary', label: 'Axilar média', placeholder: 'ex: 14' },
  triceps: { name: 'triceps', label: 'Tríceps', placeholder: 'ex: 18' },
  subscapular: { name: 'subscapular', label: 'Subescapular', placeholder: 'ex: 16' },
  abdominal: { name: 'abdominal', label: 'Abdominal', placeholder: 'ex: 20' },
  suprailiac: { name: 'suprailiac', label: 'Supra-ilíaca', placeholder: 'ex: 15' },
  thigh: { name: 'thigh', label: 'Coxa', placeholder: 'ex: 22' },
};

interface SkinfoldCalculatorProps {
  data: SkinfoldInput;
  inputValues: SkinfoldInputValues;
  errors: Partial<Record<keyof SkinfoldInput, string>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleCalculate: () => void;
  handleReset: () => void;
}

export default function SkinfoldCalculator({
  data,
  inputValues,
  errors,
  handleChange,
  handleCalculate,
  handleReset,
}: SkinfoldCalculatorProps) {
  const skinfoldFields = getRequiredSkinfoldFields(data).map((f) => SKINFOLD_FIELDS[f]);

  return (
    <div className="form">
      <BasicFields data={data} inputValues={inputValues} errors={errors} onChange={handleChange} />

      <InputField
        type="select"
        label="Protocolo"
        name="protocol"
        value={data.protocol}
        options={skinfoldProtocolOptions}
        onChange={handleChange}
      />

      <h2>Dobras cutâneas</h2>
      <div className="form-grid">
        {skinfoldFields.map((field) => (
          <InputField
            key={field.name}
            label={field.label}
            name={field.name}
            value={inputValues[field.name] ?? ''}
            error={errors[field.name]}
            placeholder={field.placeholder}
            unit="mm"
            inputMode="decimal"
            maxLength={5}
            onChange={handleChange}
          />
        ))}
      </div>

      <div className="form-actions">
        <button onClick={handleCalculate}>Calcular</button>
        <button className="btn-secondary" onClick={handleReset}>
          Resetar
        </button>
      </div>
    </div>
  );
}
