import { useState, useEffect } from 'react';
import {
  Menu,
  Sun,
  Moon,
  LayoutDashboard,
  Users,
  ClipboardPlus,
  History,
  FileText,
  Settings,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import '../styles/sidebar.css';

interface SidebarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export function Sidebar({ theme, onToggleTheme }: SidebarProps) {
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
            className={`item ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => handleNavigate('/dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>{t('sidebar.dashboard')}</span>
          </div>

          <div
            className={`item ${isActive('/students') ? 'active' : ''}`}
            onClick={() => handleNavigate('/students')}
          >
            <Users size={18} />
            <span>{t('sidebar.students')}</span>
          </div>

          <div
            className={`item ${isActive('/') ? 'active' : ''}`}
            onClick={() => handleNavigate('/')}
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
        </nav>

        <div className="sidebar-footer">
          <div className="item" onClick={onToggleTheme}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === 'dark' ? t('sidebar.lightTheme') : t('sidebar.darkTheme')}</span>
          </div>
        </div>
      </aside>
    </>
  );
}
