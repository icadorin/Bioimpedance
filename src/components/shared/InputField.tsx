import type { ChangeEvent, FocusEvent } from 'react';

interface BaseFieldProps {
  label: string;
  name: string;
  error?: string;
}

interface InputFieldProps extends BaseFieldProps {
  type?: 'input';
  value: string | number;
  unit?: string;
  placeholder?: string;
  inputMode?: 'numeric' | 'decimal' | 'tel' | 'email';
  maxLength?: number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
}

interface SelectFieldProps extends BaseFieldProps {
  type: 'select';
  value: string;
  options: { label: string; value: string }[];
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: FocusEvent<HTMLSelectElement>) => void;
}

type FieldProps = InputFieldProps | SelectFieldProps;

export function InputField(props: FieldProps) {
  const { label, name, error } = props;

  if (props.type === 'select') {
    return (
      <div className="field-group">
        <label className="field-label">{label}</label>
        <select
          name={name}
          value={props.value}
          onChange={props.onChange}
          onBlur={props.onBlur}
          className={error ? 'error' : ''}
        >
          {props.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <small>{error}</small>}
      </div>
    );
  }

  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      <div className="input-wrapper">
        <input
          name={name}
          value={props.value}
          className={error ? 'error' : ''}
          placeholder={props.placeholder ?? label}
          onChange={props.onChange}
          onBlur={props.onBlur}
          autoComplete="off"
          inputMode={props.inputMode}
          maxLength={props.maxLength}
        />
        {props.unit && <span className="input-suffix">{props.unit}</span>}
      </div>
      {error && <small>{error}</small>}
    </div>
  );
}
