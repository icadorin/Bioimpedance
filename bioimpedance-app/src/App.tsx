import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { ROUTES } from './routes/paths';
import Dashboard from './features/dashboard/pages/Dashboard';
import NewAssessment from './features/assessment/pages/NewAssessment';
import Clients from './features/clients/pages/Clients';
import ClientProfile from './features/clients/pages/ClientProfile';
import PDFPreview from './features/pdf/pages/PDFPreview';
import Payments from './features/payments/pages/Payments';
import RequireFeature from './features/billing/components/RequireFeature';
import { BillingProvider } from './features/billing/hooks/useBilling';
import Settings from './pages/Settings';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') ?? 'dark';
  });

  useEffect(() => {
    document.body.className = theme === 'light' ? 'light' : '';
  }, [theme]);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';

    setTheme(next);
    localStorage.setItem('theme', next);

    document.body.classList.add('theme-transitioning');
    document.body.className =
      next === 'light' ? 'light theme-transitioning' : 'theme-transitioning';

    setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
    }, 300);
  }

  return (
    <BrowserRouter>
      <BillingProvider>
        <div className="layout">
          <Sidebar />
          <main className="content">
            <Routes>
              <Route
                path={ROUTES.dashboard}
                element={
                  <RequireFeature feature="charts" title="Dashboard Pro">
                    <Dashboard />
                  </RequireFeature>
                }
              />
              <Route path={ROUTES.newAssessment} element={<NewAssessment />} />
              <Route
                path={ROUTES.newAssessmentWithClient}
                element={
                  <RequireFeature feature="history" title="Histórico de clientes">
                    <NewAssessment />
                  </RequireFeature>
                }
              />
              <Route
                path={ROUTES.clients}
                element={
                  <RequireFeature feature="history" title="Clientes e histórico">
                    <Clients />
                  </RequireFeature>
                }
              />
              <Route
                path={ROUTES.history}
                element={
                  <RequireFeature feature="history" title="Histórico Pro">
                    <Clients />
                  </RequireFeature>
                }
              />
              <Route
                path={ROUTES.clientProfile}
                element={
                  <RequireFeature feature="history" title="Perfil do cliente">
                    <ClientProfile />
                  </RequireFeature>
                }
              />
              <Route
                path={ROUTES.pdfs}
                element={
                  <RequireFeature feature="pdf" title="PDFs Pro">
                    <PDFPreview />
                  </RequireFeature>
                }
              />
              <Route path="/payments" element={<Payments />} />
              <Route
                path="/settings"
                element={<Settings theme={theme} onToggleTheme={toggleTheme} />}
              />
            </Routes>
          </main>
        </div>
      </BillingProvider>
    </BrowserRouter>
  );
}
