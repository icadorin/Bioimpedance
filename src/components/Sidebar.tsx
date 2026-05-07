import { useState, useEffect } from 'react';
import { Menu, Calculator, BarChart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../assets/sidebar.css';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function handleNavigate(path: string) {
    navigate(path);

    // comportamento mobile: fecha ao clicar
    if (isMobile) {
      setMobileOpen(false);
    }
  }

  function isActive(path: string) {
    return location.pathname === path;
  }

  return (
    <>
      {/* BOTÃO MOBILE (topo) */}
      {isMobile && (
        <button className="mobileMenuBtn" onClick={() => setMobileOpen(true)}>
          <Menu size={20} />
        </button>
      )}

      {/* OVERLAY */}
      {isMobile && mobileOpen && <div className="overlay" onClick={() => setMobileOpen(false)} />}

      {/* SIDEBAR */}
      <aside
        className={`sidebar 
        ${collapsed ? 'collapsed' : ''} 
        ${mobileOpen ? 'open' : ''}`}
      >
        <div className="sidebar-logo">
          <img src="/favicon/apple-touch-icon.png" alt="Logo" width={36} height={36} />
        </div>
        {/* TOGGLE DESKTOP */}
        {!isMobile && (
          <button className="toggle" onClick={() => setCollapsed(!collapsed)}>
            <Menu size={18} />
          </button>
        )}

        <nav>
          <div
            className={`item ${isActive('/') ? 'active' : ''}`}
            onClick={() => handleNavigate('/')}
          >
            <Calculator size={18} />
            <span>Calculadora</span>
          </div>

          <div
            className={`item ${isActive('/progress') ? 'active' : ''}`}
            onClick={() => handleNavigate('/progress')}
          >
            <BarChart size={18} />
            <span>Progresso</span>
          </div>
        </nav>
      </aside>
    </>
  );
}
