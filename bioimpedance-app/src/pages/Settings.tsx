import { Globe, Check, Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../styles/settings.css';

interface SettingsProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export default function Settings({ theme, onToggleTheme }: SettingsProps) {
  const { t, i18n } = useTranslation();

  function handleLanguageChange(language: string) {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  }

  return (
    <div className="container">
      <h1>{t('settings.title')}</h1>

      <div className="settings-card">
        <div className="settings-section">
          <div className="settings-section-title">
            <Globe size={16} />
            {t('settings.language')}
          </div>
          <div className="language-options">
            <button
              className={`lang-btn ${i18n.language === 'pt' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('pt')}
            >
              {i18n.language === 'pt' && <Check size={14} />}
              Português
            </button>
            <button
              className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('en')}
            >
              {i18n.language === 'en' && <Check size={14} />}
              English
            </button>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-title">
            {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            {t('settings.theme')}
          </div>
          <div className="language-options">
            {' '}
            <button
              className={`lang-btn ${theme === 'light' ? 'active' : ''}`}
              onClick={onToggleTheme}
            >
              {theme === 'light' && <Check size={14} />}
              Claro
            </button>
            <button
              className={`lang-btn ${theme === 'dark' ? 'active' : ''}`}
              onClick={onToggleTheme}
            >
              {theme === 'dark' && <Check size={14} />}
              Escuro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
