import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';

import CalculatorPage from './pages/CalculatorPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <Sidebar />

        <main className="content">
          <Routes>
            <Route path="/" element={<CalculatorPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
