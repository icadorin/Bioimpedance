import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import CalculatorPage from './pages/CalculatorPage';

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
        <Sidebar theme={theme} onToggleTheme={toggleTheme} />
        <main className="content">
          <Routes>
            <Route path="/" element={<CalculatorPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
