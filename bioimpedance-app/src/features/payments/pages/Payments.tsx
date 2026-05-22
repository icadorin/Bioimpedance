import BillingPlans from '../../billing/components/BillingPlans';

export default function Payments() {
  return (
    <div className="container">
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 700 }}>Pagamentos</h1>
        <p style={{ margin: '0 0 24px', color: 'var(--muted)' }}>
          Gerencie sua assinatura e escolha o plano ideal para você.
        </p>
        <BillingPlans />
      </div>
    </div>
  );
}
