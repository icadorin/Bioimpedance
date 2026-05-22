import { useState, useEffect } from 'react';
import {
  Menu,
  LayoutDashboard,
  Users,
  ClipboardPlus,
  History,
  FileText,
  Settings,
  CreditCard,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../routes/paths';
import '../../styles/sidebar.css';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  const [isHovered, setIsHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  function handleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebarCollapsed', String(next));
  }

  const handleMouseEnter = () => {
    if (!isMobile) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (!isMobile) setIsHovered(false);
  };

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

  const isCollapsed = !isMobile && collapsed && !isHovered;

  return (
    <>
      {isMobile && (
        <button className="mobileMenuBtn" onClick={() => setMobileOpen(true)}>
          <Menu size={20} />
        </button>
      )}

      {isMobile && mobileOpen && <div className="overlay" onClick={() => setMobileOpen(false)} />}

      <aside
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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
            className={`item ${isActive(ROUTES.dashboard) ? 'active' : ''}`}
            onClick={() => handleNavigate(ROUTES.dashboard)}
          >
            <LayoutDashboard size={18} />
            <span>{t('sidebar.dashboard')}</span>
          </div>

          <div
            className={`item ${isActive(ROUTES.clients) ? 'active' : ''}`}
            onClick={() => handleNavigate(ROUTES.clients)}
          >
            <Users size={18} />
            <span>{t('sidebar.clients')}</span>
          </div>

          <div
            className={`item ${isActive(ROUTES.newAssessment) ? 'active' : ''}`}
            onClick={() => handleNavigate(ROUTES.newAssessment)}
          >
            <ClipboardPlus size={18} />
            <span>{t('sidebar.newAssessment')}</span>
          </div>

          <div
            className={`item ${isActive('/history') ? 'active' : ''}`}
            onClick={() => handleNavigate('/history')}
          >
            <History size={18} />
            <span>{t('sidebar.history')}</span>
          </div>

          <div
            className={`item ${isActive('/pdfs') ? 'active' : ''}`}
            onClick={() => handleNavigate('/pdfs')}
          >
            <FileText size={18} />
            <span>{t('sidebar.pdfs')}</span>
          </div>

          <div
            className={`item ${isActive('/settings') ? 'active' : ''}`}
            onClick={() => handleNavigate('/settings')}
          >
            <Settings size={18} />
            <span>{t('sidebar.settings')}</span>
          </div>

          <div
            className={`item ${isActive('/payments') ? 'active' : ''}`}
            onClick={() => handleNavigate('/payments')}
          >
            <CreditCard size={18} />
            <span>{t('sidebar.payments')}</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="developed-by">
            Desenvolvido por <strong>Israel Cadorin</strong>
          </div>
        </div>
      </aside>
    </>
  );
}
