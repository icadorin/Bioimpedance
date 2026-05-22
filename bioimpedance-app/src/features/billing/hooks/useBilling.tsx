import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api } from '../../../services/api';
import type { BillingFeatureKey, BillingPlan, BillingSubscription, Plan } from '../types';

type BillingContextValue = {
  plans: BillingPlan[];
  subscription: BillingSubscription | null;
  currentPlan: Plan;
  isLoading: boolean;
  error: string;
  hasFeature: (feature: BillingFeatureKey) => boolean;
  refreshBilling: () => Promise<void>;
  startCheckout: (plan: Plan) => Promise<void>;
  openCustomerPortal: () => Promise<void>;
};

const BillingContext = createContext<BillingContextValue | null>(null);

export function BillingProvider({ children }: { children: ReactNode }) {
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [subscription, setSubscription] = useState<BillingSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshBilling = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const [plansResponse, subscriptionResponse] = await Promise.all([
        api.getBillingPlans(),
        api.getBillingSubscription(),
      ]);

      setPlans(plansResponse);
      setSubscription(subscriptionResponse);
    } catch (caughtError) {
      console.error('Erro ao carregar billing:', caughtError);
      setError(caughtError instanceof Error ? caughtError.message : 'Erro ao carregar assinatura');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshBilling();
  }, [refreshBilling]);

  const hasFeature = useCallback(
    (feature: BillingFeatureKey) => {
      if (feature === 'calculator') return true;
      return subscription?.features.some((item) => item.key === feature && item.included) ?? false;
    },
    [subscription]
  );

  const startCheckout = useCallback(async (plan: Plan) => {
    const checkout = await api.createCheckoutSession(plan);
    window.location.assign(checkout.url);
  }, []);

  const openCustomerPortal = useCallback(async () => {
    const portal = await api.createCustomerPortalSession();
    window.location.assign(portal.url);
  }, []);

  const value = useMemo<BillingContextValue>(
    () => ({
      plans,
      subscription,
      currentPlan: subscription?.plan ?? 'basic',
      isLoading,
      error,
      hasFeature,
      refreshBilling,
      startCheckout,
      openCustomerPortal,
    }),
    [
      plans,
      subscription,
      isLoading,
      error,
      hasFeature,
      refreshBilling,
      startCheckout,
      openCustomerPortal,
    ]
  );

  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
}

export function useBilling() {
  const context = useContext(BillingContext);

  if (!context) {
    throw new Error('useBilling deve ser usado dentro de BillingProvider');
  }

  return context;
}
