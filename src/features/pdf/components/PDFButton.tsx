import { FileText, Loader2 } from 'lucide-react';

interface PDFButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  label?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export default function PDFButton({
  onClick,
  isLoading = false,
  label = 'Gerar PDF',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
}: PDFButtonProps) {
  const sizeMap = {
    sm: { padding: '6px 12px', fontSize: '12px' },
    md: { padding: '10px 18px', fontSize: '14px' },
    lg: { padding: '14px 24px', fontSize: '16px' },
  };

  const variantStyles =
    variant === 'primary'
      ? {
          background: 'var(--accent)',
          color: 'white',
          border: 'none',
        }
      : {
          background: 'transparent',
          color: 'var(--text)',
          border: '1px solid var(--border)',
        };

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        borderRadius: '0.3rem',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        fontWeight: 600,
        opacity: isLoading ? 0.7 : 1,
        transition: 'all 0.2s ease',
        width: fullWidth ? '100%' : 'auto',
        ...variantStyles,
        ...sizeMap[size],
      }}
    >
      {isLoading ? (
        <>
          <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" />
          Gerando...
        </>
      ) : (
        <>
          <FileText size={size === 'sm' ? 14 : 16} />
          {label}
        </>
      )}
    </button>
  );
}
