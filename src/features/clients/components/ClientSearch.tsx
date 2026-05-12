interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function ClientSearch({ value, onChange }: Props) {
  return (
    <input
      className="client-search"
      type="text"
      placeholder="Buscar cliente..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
