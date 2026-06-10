import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, GraduationCap, LayoutDashboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const AdminNavbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-b border-dark-100 dark:border-dark-800 transition-colors duration-300">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <Link to="/admin" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-glow-orange group-hover:shadow-glow-orange-lg transition-all duration-300">
                <GraduationCap size={18} className="text-white" />
              </div>
              <span className="font-display font-bold text-xl text-dark-900 dark:text-white hidden sm:block">
                Uni<span className="text-primary-500">Stay</span> <span className="text-sm font-medium text-dark-400 ml-1">Admin</span>
              </span>
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center bg-dark-50 dark:bg-dark-800 rounded-full p-1 border border-dark-100 dark:border-dark-700 overflow-hidden"
              title="Toggle Language"
            >
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-300 ${
                  language === 'en'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-dark-500 hover:text-dark-700 dark:text-dark-400 dark:hover:text-dark-200'
                }`}
              >
                EN
              </span>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-300 ${
                  language === 'ar'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-dark-500 hover:text-dark-700 dark:text-dark-400 dark:hover:text-dark-200'
                }`}
                style={{ fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}
              >
                ع
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn-ghost p-2 rounded-xl text-dark-500 hover:text-primary-500"
              aria-label={isDark ? t('nav.light_mode') : t('nav.dark_mode')}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="w-px h-6 bg-dark-200 dark:bg-dark-700 hidden sm:block mx-1"></div>

            {/* Public site link */}
            <Link 
              to="/" 
              className="btn-ghost p-2 rounded-xl text-dark-500 hover:text-primary-500 hidden sm:flex"
              title="View Public Site"
            >
              <LayoutDashboard size={20} />
            </Link>

            {/* Logout (if authenticated) */}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="btn-ghost p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                aria-label={t('nav.logout')}
                title={t('nav.logout')}
              >
                <LogOut size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
