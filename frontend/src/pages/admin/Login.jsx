import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { authAPI } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Admin Login - UniStay';
    if (isAuthenticated) navigate('/admin', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error(t('admin.login.fill_all_fields'));
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data.token, res.data.admin);
      toast.success(t('admin.login.welcome_back'));
      navigate('/admin', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || t('admin.login.login_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-slate-50 dark:bg-dark-900">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mx-auto mb-4 shadow-glow-orange">
              <GraduationCap size={32} className="text-white" />
            </div>
            <h1 className="font-display font-bold text-2xl text-dark-900 dark:text-white mb-1">
              {t('admin.login.title')}
            </h1>
            <p className="text-dark-500 dark:text-dark-400 text-sm">
              {t('admin.login.subtitle')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="admin-email" className="label">
                {t('admin.login.email_label')}
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className={`absolute top-1/2 -translate-y-1/2 text-dark-400 ${
                    isRTL ? 'right-3.5' : 'left-3.5'
                  }`}
                />
                <input
                  id="admin-email"
                  type="email"
                  placeholder={t('admin.login.email_placeholder')}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`input ${isRTL ? 'pr-10' : 'pl-10'}`}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="admin-password" className="label">
                {t('admin.login.password_label')}
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className={`absolute top-1/2 -translate-y-1/2 text-dark-400 ${
                    isRTL ? 'right-3.5' : 'left-3.5'
                  }`}
                />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('admin.login.password_placeholder')}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`input ${isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'}`}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  id="toggle-password"
                  className={`absolute top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 dark:hover:text-dark-300 transition-colors ${
                    isRTL ? 'left-3' : 'right-3'
                  }`}
                  aria-label={showPassword ? t('admin.login.hide_password') : t('admin.login.show_password')}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="admin-login-submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  {t('admin.login.sign_in')}
                </>
              )}
            </button>
          </form>

          {/* Default credentials hint */}
          <div className="mt-6 p-3 bg-dark-50 dark:bg-dark-700/50 rounded-xl text-xs text-dark-500 dark:text-dark-400 text-center">
            {t('admin.login.default_hint')}{' '}
            <code className="font-mono text-primary-500">admin@unistay.com</code> /{' '}
            <code className="font-mono text-primary-500">Admin@123</code>
          </div>
        </div>

        <p className="text-center mt-4 text-sm text-dark-400">
          <Link to="/" className="text-primary-500 hover:text-primary-600 transition-colors">
            {t('admin.login.back_to_site')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
