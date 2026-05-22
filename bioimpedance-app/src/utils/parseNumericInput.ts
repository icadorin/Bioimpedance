type ParsedNumericInput = {
  numericValue: number;
};

export function parseNumericInput(value: string, isDecimal: boolean): ParsedNumericInput | null {
  if (isDecimal) {
    const displayValue = value.replace(',', '.');
    if (!/^\d*\.?\d*$/.test(displayValue)) return null;
    const numericValue = displayValue === '' || displayValue === '.' ? 0 : Number(displayValue);
    return { numericValue };
  }

  if (!/^\d*$/.test(value)) return null;
  const numericValue = value === '' ? 0 : Number(value);
  return { numericValue };
}
