export type Plan = 'basic' | 'pro' | 'studio';

export type BillingFeatureKey =
  | 'calculator'
  | 'history'
  | 'pdf'
  | 'charts'
  | 'body_comparison'
  | 'pdf_customization'
  | 'custom_branding'
  | 'advanced_reports';

export type BillingFeature = {
  key: BillingFeatureKey;
  label: string;
  included: boolean;
};

export type BillingPlan = {
  plan: Plan;
  name: string;
  sortOrder: number;
  paid: boolean;
  checkoutReady: boolean;
  features: BillingFeature[];
};

export type BillingSubscription = {
  plan: Plan;
  planName: string;
  status: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  billingPortalReady: boolean;
  features: BillingFeature[];
};

export type CheckoutResponse = {
  url: string;
};

export type CustomerPortalResponse = {
  url: string;
};
