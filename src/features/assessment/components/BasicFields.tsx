import type { ChangeEvent } from 'react';
import { InputField } from '../../../components/shared/InputField';
import { genderOptions, activityOptions, objectiveOptions } from '../config/selectOptions';

interface BasicFieldsData {
  gender: string;
  activityLevel: string;
  objective: string;
}

interface BasicFieldsInputValues {
  weight: string;
  height: string;
  age: string;
}

interface BasicFieldsErrors {
  weight?: string;
  height?: string;
  age?: string;
}

interface BasicFieldsProps {
  data: BasicFieldsData;
  inputValues: BasicFieldsInputValues;
  errors: BasicFieldsErrors;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export function BasicFields({ data, inputValues, errors, onChange }: BasicFieldsProps) {
  return (
    <div className="basic-fields">
      <h2>Dados básicos</h2>
      <div className="form-grid">
        <InputField
          label="Peso"
          name="weight"
          value={inputValues.weight}
          error={errors.weight}
          unit="kg"
          inputMode="decimal"
          maxLength={5}
          onChange={onChange}
        />
        <InputField
          label="Altura"
          name="height"
          value={inputValues.height}
          error={errors.height}
          unit="cm"
          inputMode="decimal"
          maxLength={5}
          onChange={onChange}
        />
        <InputField
          label="Idade"
          name="age"
          value={inputValues.age}
          error={errors.age}
          unit="anos"
          inputMode="numeric"
          maxLength={3}
          onChange={onChange}
        />
        <InputField
          type="select"
          label="Sexo"
          name="gender"
          value={data.gender}
          options={genderOptions}
          onChange={onChange}
        />
        <InputField
          type="select"
          label="Nível de atividade"
          name="activityLevel"
          value={data.activityLevel}
          options={activityOptions}
          onChange={onChange}
        />
        <InputField
          type="select"
          label="Objetivo"
          name="objective"
          value={data.objective}
          options={objectiveOptions}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
