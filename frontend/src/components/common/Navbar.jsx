import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sun, Moon, Menu, X, GraduationCap, LayoutDashboard, LogOut, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const { language, setLanguage, isRTL } = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isAdminRoute = location.pathname.startsWith('/admin');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-b border-dark-100 dark:border-dark-800 transition-colors duration-300">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-glow-orange group-hover:shadow-glow-orange-lg transition-all duration-300">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-dark-900 dark:text-white">
              Uni<span className="text-primary-500">Stay</span>
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          {!isAdminRoute && (
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm mx-6">
              <div className="relative w-full">
                <Search
                  size={16}
                  className={`absolute top-1/2 -translate-y-1/2 text-dark-400 dark:text-dark-500 pointer-events-none ${
                    isRTL ? 'right-3' : 'left-3'
                  }`}
                />
                <input
                  type="text"
                  placeholder={t('nav.search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`input py-2 text-sm ${isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'}`}
                  id="navbar-search"
                />
              </div>
            </form>
          )}

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              id="language-toggle"
              aria-label="Toggle language"
              className="relative flex items-center gap-1 h-9 rounded-xl bg-dark-100 dark:bg-dark-700 border border-dark-200 dark:border-dark-600 overflow-hidden transition-all duration-200 hover:border-primary-400 px-1"
              title={language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
            >
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  language === 'en'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-dark-500 dark:text-dark-400'
                }`}
              >
                EN
              </span>
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  language === 'ar'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-dark-500 dark:text-dark-400'
                }`}
                style={{ fontFamily: "'IBM Plex Sans Arabic', 'Noto Sans Arabic', system-ui" }}
              >
                ع
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              id="theme-toggle"
              aria-label="Toggle theme"
              className="btn-ghost p-2 rounded-xl"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isAuthenticated ? (
              <>
                <Link to="/admin" className="btn-ghost">
                  <LayoutDashboard size={16} />
                  {t('nav.dashboard')}
                </Link>
                <button onClick={handleLogout} className="btn-secondary">
                  <LogOut size={16} />
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <Link to="/admin/login" className="btn-primary">
                {t('nav.admin')}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden btn-ghost p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle mobile menu"
            id="mobile-menu-toggle"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-dark-100 dark:border-dark-800 bg-white dark:bg-dark-900"
          >
            <div className="page-container py-4 flex flex-col gap-3">
              {!isAdminRoute && (
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search
                      size={16}
                      className={`absolute top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none ${
                        isRTL ? 'right-3' : 'left-3'
                      }`}
                    />
                    <input
                      type="text"
                      placeholder={t('nav.search_placeholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`input ${isRTL ? 'pr-9' : 'pl-9'}`}
                      id="mobile-search"
                    />
                  </div>
                </form>
              )}

              {/* Language + Theme row */}
              <div className="flex items-center gap-2">
                {/* Language switcher - mobile */}
                <button
                  onClick={toggleLanguage}
                  id="mobile-language-toggle"
                  className="flex items-center gap-1 h-9 rounded-xl bg-dark-100 dark:bg-dark-700 border border-dark-200 dark:border-dark-600 overflow-hidden px-1 flex-1 justify-center"
                >
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      language === 'en' ? 'bg-primary-500 text-white' : 'text-dark-500 dark:text-dark-400'
                    }`}
                  >
                    EN
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      language === 'ar' ? 'bg-primary-500 text-white' : 'text-dark-500 dark:text-dark-400'
                    }`}
                    style={{ fontFamily: "'IBM Plex Sans Arabic', 'Noto Sans Arabic', system-ui" }}
                  >
                    ع
                  </span>
                </button>

                <button onClick={toggleTheme} className="btn-ghost flex-1 justify-center">
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
                  {isDark ? t('nav.light_mode') : t('nav.dark_mode')}
                </button>
              </div>

              {/* Auth buttons */}
              <div className="flex items-center gap-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="btn-ghost flex-1 justify-center"
                    >
                      <LayoutDashboard size={16} /> {t('nav.dashboard')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="btn-secondary flex-1 justify-center"
                    >
                      <LogOut size={16} /> {t('nav.logout')}
                    </button>
                  </>
                ) : (
                  <Link
                    to="/admin/login"
                    onClick={() => setMobileOpen(false)}
                    className="btn-primary flex-1 justify-center"
                  >
                    {t('nav.admin_login')}
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
