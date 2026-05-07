import { useState, useEffect } from 'react';
import { Menu, Calculator, BarChart, Sun, Moon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../assets/sidebar.css';

interface SidebarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export function Sidebar({ theme, onToggleTheme }: SidebarProps) {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const navigate = useNavigate();
  const location = useLocation();

  function handleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebarCollapsed', String(next));
  }

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function handleNavigate(path: string) {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  }

  function isActive(path: string) {
    return location.pathname === path;
  }

  return (
    <>
      {isMobile && (
        <button className="mobileMenuBtn" onClick={() => setMobileOpen(true)}>
          <Menu size={20} />
        </button>
      )}

      {isMobile && mobileOpen && <div className="overlay" onClick={() => setMobileOpen(false)} />}

      <aside
        className={`
        sidebar 
        ${!isMobile && collapsed ? 'collapsed' : ''} 
        ${mobileOpen ? 'open' : ''}
      `}
      >
        <div className="sidebar-logo">
          <img src="/favicon/apple-touch-icon.png" alt="Logo" width={36} height={36} />
        </div>

        {!isMobile && (
          <button className="toggle" onClick={handleCollapse}>
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

        <div className="sidebar-footer">
          <div className="item" onClick={onToggleTheme}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === 'dark' ? 'Tema claro' : 'Tema escuro'}</span>
          </div>
        </div>
      </aside>
    </>
  );
}
