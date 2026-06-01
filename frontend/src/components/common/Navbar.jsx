import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sun, Moon, Menu, X, GraduationCap, LayoutDashboard, LogOut } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
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

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-b border-dark-100 dark:border-dark-800 transition-colors duration-300">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
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
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 dark:text-dark-500" />
                <input
                  type="text"
                  placeholder="Search by apartment ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-9 pr-4 py-2 text-sm"
                  id="navbar-search"
                />
              </div>
            </form>
          )}

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
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
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="btn-secondary">
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <Link to="/admin/login" className="btn-primary">
                Admin
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
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                    <input
                      type="text"
                      placeholder="Search by apartment ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input pl-9"
                      id="mobile-search"
                    />
                  </div>
                </form>
              )}
              <div className="flex items-center gap-2">
                <button onClick={toggleTheme} className="btn-ghost flex-1 justify-center">
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>
                {isAuthenticated ? (
                  <>
                    <Link to="/admin" onClick={() => setMobileOpen(false)} className="btn-ghost flex-1 justify-center">
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    <button onClick={handleLogout} className="btn-secondary flex-1 justify-center">
                      <LogOut size={16} /> Logout
                    </button>
                  </>
                ) : (
                  <Link to="/admin/login" onClick={() => setMobileOpen(false)} className="btn-primary flex-1 justify-center">
                    Admin Login
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
