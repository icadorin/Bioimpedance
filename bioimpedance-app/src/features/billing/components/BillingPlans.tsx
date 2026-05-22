import { Check, CreditCard, Crown, ExternalLink, Loader2, Sparkles, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Plan } from '../types';
import { useBilling } from '../hooks/useBilling';
import '../styles/billing.css';

const planIcons = {
  basic: CreditCard,
  pro: Sparkles,
  studio: Crown,
} satisfies Record<Plan, typeof CreditCard>;

const planDescriptions = {
  basic: 'Para usar a calculadora sem salvar histórico.',
  pro: 'Para acompanhar clientes, histórico, PDFs e comparações.',
  studio: 'Para relatórios com personalização, branding e recursos avançados.',
} satisfies Record<Plan, string>;

export default function BillingPlans() {
  const {
    plans,
    subscription,
    currentPlan,
    isLoading,
    error,
    startCheckout,
    openCustomerPortal,
    refreshBilling,
  } = useBilling();
  const [busyPlan, setBusyPlan] = useState<Plan | 'portal' | ''>('');
  const sortedPlans = useMemo(
    () => [...plans].sort((left, right) => left.sortOrder - right.sortOrder),
    [plans]
  );

  async function handleCheckout(plan: Plan) {
    setBusyPlan(plan);

    try {
      await startCheckout(plan);
    } catch (caughtError) {
      alert(caughtError instanceof Error ? caughtError.message : 'Erro ao abrir checkout');
      setBusyPlan('');
    }
  }

  async function handlePortal() {
    setBusyPlan('portal');

    try {
      await openCustomerPortal();
    } catch (caughtError) {
      alert(caughtError instanceof Error ? caughtError.message : 'Erro ao abrir portal');
      setBusyPlan('');
    }
  }

  return (
    <div className="billing-section">
      <div className="billing-section__header">
        <div>
          <h2>Planos e assinatura</h2>
          <p>Controle o acesso a recursos pagos e conecte o checkout do Stripe.</p>
        </div>
        <button className="billing-ghost-button" onClick={refreshBilling} disabled={isLoading}>
          Atualizar
        </button>
      </div>

      {error && <div className="billing-alert">{error}</div>}

      <div className="billing-current">
        <span>Plano atual</span>
        <strong>{subscription?.planName ?? 'Basic'}</strong>
        <small>Status: {subscription?.status ?? 'free'}</small>
        {subscription?.billingPortalReady && (
          <button className="billing-portal-button" onClick={handlePortal} disabled={!!busyPlan}>
            {busyPlan === 'portal' ? <Loader2 size={15} className="animate-spin" /> : <ExternalLink size={15} />}
            Gerenciar no Stripe
          </button>
        )}
      </div>

      <div className="billing-plan-grid">
        {sortedPlans.map((plan) => {
          const Icon = planIcons[plan.plan];
          const isCurrent = plan.plan === currentPlan;
          const isBusy = busyPlan === plan.plan;
          const isPortalBusy = busyPlan === 'portal';
          const usePortalForChange = Boolean(subscription?.billingPortalReady && currentPlan !== 'basic');

          return (
            <article key={plan.plan} className={`billing-plan-card ${isCurrent ? 'active' : ''}`}>
              <div className="billing-plan-card__title">
                <Icon size={18} />
                <div>
                  <h3>{plan.name}</h3>
                  <p>{planDescriptions[plan.plan]}</p>
                </div>
              </div>

              <ul className="billing-feature-list">
                {plan.features.map((feature) => (
                  <li key={feature.key} className={feature.included ? 'included' : 'excluded'}>
                    {feature.included ? <Check size={14} /> : <X size={14} />}
                    <span>{feature.label}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <button disabled className="billing-plan-button current">
                  Plano atual
                </button>
              ) : plan.paid ? (
                <button
                  className="billing-plan-button"
                  onClick={() => (usePortalForChange ? handlePortal() : handleCheckout(plan.plan))}
                  disabled={(!usePortalForChange && !plan.checkoutReady) || !!busyPlan}
                  title={
                    !usePortalForChange && !plan.checkoutReady
                      ? 'Configure o Price ID deste plano no backend'
                      : undefined
                  }
                >
                  {(isBusy || isPortalBusy) && <Loader2 size={15} className="animate-spin" />}
                  {plan.checkoutReady
                    ? usePortalForChange
                      ? 'Alterar no Stripe'
                      : 'Assinar'
                    : 'Configurar Price ID'}
                </button>
              ) : usePortalForChange ? (
                <button className="billing-plan-button" onClick={handlePortal} disabled={!!busyPlan}>
                  Alterar no Stripe
                </button>
              ) : (
                <button disabled className="billing-plan-button current">
                  Incluído
                </button>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
