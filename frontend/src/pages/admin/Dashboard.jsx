import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Building2, MapPin, CheckCircle,
  XCircle, Star, Clock, ChevronRight, ChevronLeft, Hash,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { adminAPI } from '../../api/axios';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(price);

const StatCard = ({ icon: Icon, label, value, color, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="card p-6"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-dark-500 dark:text-dark-400 mb-1">{label}</p>
        <p className={`font-display font-bold text-3xl ${color}`}>{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-opacity-10 ${color.replace('text-', 'bg-')}/10`}>
        <Icon size={24} className={color} />
      </div>
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;

  useEffect(() => {
    document.title = 'Admin Dashboard - UniStay';
    adminAPI.getStats()
      .then((res) => setStats(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        { icon: MapPin,      label: t('admin.dashboard.total_districts'),  value: stats.totalDistricts,      color: 'text-indigo-500'  },
        { icon: Building2,   label: t('admin.dashboard.total_apartments'), value: stats.totalApartments,     color: 'text-primary-500' },
        { icon: CheckCircle, label: t('admin.dashboard.available'),        value: stats.availableApartments, color: 'text-emerald-500' },
        { icon: Star,        label: t('admin.dashboard.featured'),         value: stats.featuredApartments,  color: 'text-amber-500'   },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-900 animate-fade-in">
      {/* Admin Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-dark-100 dark:border-dark-700">
        <div className="page-container py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
              <LayoutDashboard size={20} className="text-primary-500" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-dark-900 dark:text-white">
                {t('admin.dashboard.title')}
              </h1>
              <p className="text-xs text-dark-400 dark:text-dark-500">
                {t('admin.dashboard.subtitle')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-8 space-y-8">
        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="shimmer h-4 rounded w-24 mb-3" />
                <div className="shimmer h-8 rounded w-16" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((s, i) => <StatCard key={s.label} {...s} index={i} />)}
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="font-display font-semibold text-lg text-dark-800 dark:text-dark-200 mb-4">
            {t('admin.dashboard.quick_actions')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/admin/districts"
              id="quick-action-districts"
              className="card p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                <MapPin size={22} className="text-indigo-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-dark-800 dark:text-dark-100 group-hover:text-primary-500 transition-colors">
                  {t('admin.dashboard.manage_districts')}
                </p>
                <p className="text-sm text-dark-400">
                  {t('admin.dashboard.districts_count_other', { count: stats?.totalDistricts ?? '—' })}
                </p>
              </div>
              <ArrowIcon size={18} className="text-dark-300 group-hover:text-primary-500 transition-all" />
            </Link>

            <Link
              to="/admin/apartments"
              id="quick-action-apartments"
              className="card p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center">
                <Building2 size={22} className="text-primary-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-dark-800 dark:text-dark-100 group-hover:text-primary-500 transition-colors">
                  {t('admin.dashboard.manage_apartments')}
                </p>
                <p className="text-sm text-dark-400">
                  {t('admin.dashboard.apartments_count_other', { count: stats?.totalApartments ?? '—' })}
                </p>
              </div>
              <ArrowIcon size={18} className="text-dark-300 group-hover:text-primary-500 transition-all" />
            </Link>
          </div>
        </div>

        {/* Recent Listings */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-primary-500" />
            <h2 className="font-display font-semibold text-lg text-dark-800 dark:text-dark-200">
              {t('admin.dashboard.recent_listings')}
            </h2>
          </div>
          <div className="card overflow-hidden">
            {loading ? (
              <div className="divide-y divide-dark-100 dark:divide-dark-700">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
                    <div className="shimmer w-10 h-10 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="shimmer h-4 rounded w-1/2" />
                      <div className="shimmer h-3 rounded w-1/3" />
                    </div>
                    <div className="shimmer h-6 rounded-full w-20" />
                  </div>
                ))}
              </div>
            ) : stats?.recentApartments?.length > 0 ? (
              <div className="divide-y divide-dark-100 dark:divide-dark-700">
                {stats.recentApartments.map((apt) => (
                  <Link
                    key={apt._id}
                    to={`/apartments/${apt._id}`}
                    target="_blank"
                    className="flex items-center gap-4 p-4 hover:bg-dark-50 dark:hover:bg-dark-700/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-dark-100 dark:bg-dark-700 shrink-0">
                      {apt.images?.[0] ? (
                        <img src={apt.images[0]} alt={apt.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 size={16} className="text-dark-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-dark-800 dark:text-dark-100 truncate group-hover:text-primary-500 transition-colors">
                        {apt.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-dark-400">
                        <Hash size={10} />
                        {apt.apartmentId}
                        {apt.districtId?.name && <span>• {apt.districtId.name}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={apt.available ? 'badge-available' : 'badge-unavailable'}>
                        {apt.available ? t('admin.dashboard.available_badge') : t('admin.dashboard.unavailable_badge')}
                      </span>
                      <span className="font-semibold text-sm text-primary-500">
                        {formatPrice(apt.price)}/mo
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-dark-400 text-sm">
                {t('admin.dashboard.no_apartments')}{' '}
                <Link to="/admin/apartments" className="text-primary-500 hover:underline">
                  {t('admin.dashboard.add_first')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
