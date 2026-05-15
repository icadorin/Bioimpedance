import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { ROUTES } from './routes/paths';
import Dashboard from './features/dashboard/pages/Dashboard';
import NewAssessment from './features/assessment/pages/NewAssessment';
import Clients from './features/clients/pages/Clients';
import ClientProfile from './features/clients/pages/ClientProfile';
import PDFPreview from './features/pdf/pages/PDFPreview';
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
      <div className="layout">
        <Sidebar />
        <main className="content">
          <Routes>
            <Route path={ROUTES.dashboard} element={<Dashboard />} />
            <Route path={ROUTES.newAssessment} element={<NewAssessment />} />
            <Route path={ROUTES.newAssessmentWithClient} element={<NewAssessment />} />
            <Route path={ROUTES.clients} element={<Clients />} />
            <Route path={ROUTES.clientProfile} element={<ClientProfile />} />
            <Route path={ROUTES.pdfs} element={<PDFPreview />} />
            <Route
              path="/settings"
              element={<Settings theme={theme} onToggleTheme={toggleTheme} />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
