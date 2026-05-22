import { LockKeyhole } from 'lucide-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BillingFeatureKey } from '../types';
import { useBilling } from '../hooks/useBilling';
import '../styles/billing.css';

type Props = {
  feature: BillingFeatureKey;
  title: string;
  children: ReactNode;
};

export default function RequireFeature({ feature, title, children }: Props) {
  const navigate = useNavigate();
  const { hasFeature, isLoading, currentPlan } = useBilling();

  if (isLoading) {
    return (
      <div className="container">
        <div className="billing-empty-state">Carregando assinatura...</div>
      </div>
    );
  }

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  return (
    <div className="container">
      <div className="upgrade-panel">
        <LockKeyhole size={28} />
        <h1>{title}</h1>
        <p>
          Seu plano atual é {currentPlan.toUpperCase()}. Esse recurso fica disponível nos planos Pro
          e Studio.
        </p>
        <button onClick={() => navigate('/payments')}>Ver planos</button>
      </div>
    </div>
  );
}
