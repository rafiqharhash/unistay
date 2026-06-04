import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, ArrowRight, ArrowLeft, Building2, MapPin, Star,
  Users, ChevronDown, Sparkles,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { districtAPI, apartmentAPI } from '../api/axios';
import DistrictCard from '../components/district/DistrictCard';
import ApartmentCard from '../components/apartment/ApartmentCard';
import { SkeletonDistrictCard } from '../components/common/SkeletonCard';
import SkeletonCard from '../components/common/SkeletonCard';

const Home = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [districts, setDistricts] = useState([]);
  const [featuredApartments, setFeaturedApartments] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [showAllDistricts, setShowAllDistricts] = useState(false);

  const HERO_STATS = [
    { icon: Building2, label: t('home.stats_apartments'), value: '200+' },
    { icon: MapPin,     label: t('home.stats_districts'),  value: '15+'  },
    { icon: Users,      label: t('home.stats_students'),   value: '1000+'},
    { icon: Star,       label: t('home.stats_rating'),     value: '4.8★' },
  ];

  useEffect(() => {
    document.title = 'UniStay - Student Housing Made Simple';

    districtAPI.getAll()
      .then((res) => setDistricts(res.data.data || []))
      .finally(() => setLoadingDistricts(false));

    apartmentAPI.getFeatured()
      .then((res) => setFeaturedApartments(res.data.data || []))
      .finally(() => setLoadingFeatured(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const visibleDistricts = showAllDistricts ? districts : districts.slice(0, 3);
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="animate-fade-in">
      {/* ── Hero Section ──────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl" />
        </div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 page-container py-24 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6 text-sm text-primary-300"
            >
              <Sparkles size={14} className="text-primary-400" />
              {t('home.badge')}
            </motion.div>

            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-6">
              {t('home.hero_title_1')}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
                {t('home.hero_title_2')}
              </span>
            </h1>

            <p className="text-lg text-dark-300 mb-10 max-w-xl mx-auto leading-relaxed">
              {t('home.hero_subtitle')}
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-10">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className={`absolute top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none ${
                    isRTL ? 'right-4' : 'left-4'
                  }`}
                />
                <input
                  id="hero-search"
                  type="text"
                  placeholder={t('home.search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all text-sm`}
                />
              </div>
              <button type="submit" className="btn-primary px-6 py-3.5 text-base">
                {t('home.search_btn')}
                <ArrowIcon size={18} />
              </button>
            </form>

            {/* Quick links */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-dark-400">{t('home.browse_label')}</span>
              {districts.slice(0, 4).map((d) => (
                <Link
                  key={d._id}
                  to={`/districts/${d._id}`}
                  className="px-3 py-1 glass rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-all duration-200 text-xs"
                >
                  {d.name}
                </Link>
              ))}
              <Link
                to="/search"
                className="px-3 py-1 rounded-full border border-primary-500/50 text-primary-400 hover:bg-primary-500/10 transition-all text-xs"
              >
                {t('home.view_all')}
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-dark-400"
        >
          <ChevronDown size={24} />
        </motion.div>
      </section>

      {/* ── Stats ─────────────────────────────────────── */}
      <section className="bg-white dark:bg-dark-800 border-y border-dark-100 dark:border-dark-700">
        <div className="page-container py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {HERO_STATS.map(({ icon: Icon, label, value }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center mx-auto mb-2">
                  <Icon size={20} className="text-primary-500" />
                </div>
                <p className="font-display font-bold text-2xl text-dark-900 dark:text-white">{value}</p>
                <p className="text-sm text-dark-500 dark:text-dark-400">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Apartments ───────────────────────── */}
      {(loadingFeatured || featuredApartments.length > 0) && (
        <section className="py-16 bg-slate-50 dark:bg-dark-900">
          <div className="page-container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Star size={16} className="text-amber-500 fill-amber-500" />
                  <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">
                    {t('home.featured_label')}
                  </span>
                </div>
                <h2 className="section-title">{t('home.featured_title')}</h2>
              </div>
              <Link to="/search?featured=true" className="btn-secondary hidden sm:flex">
                {t('home.featured_view_all')} <ArrowIcon size={15} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingFeatured
                ? Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
                : featuredApartments.map((apt, i) => (
                  <ApartmentCard key={apt._id} apartment={apt} index={i} />
                ))
              }
            </div>

            <div className="text-center mt-6 sm:hidden">
              <Link to="/search?featured=true" className="btn-secondary">
                {t('home.featured_view_all')} <ArrowIcon size={15} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Browse by District ────────────────────────── */}
      <section className="py-16 bg-white dark:bg-dark-800">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-semibold text-primary-500 uppercase tracking-wider mb-1">
                {t('home.explore_label')}
              </p>
              <h2 className="section-title">{t('home.districts_title')}</h2>
              <p className="text-dark-500 dark:text-dark-400 mt-1 text-sm">
                {t('home.districts_subtitle')}
              </p>
            </div>
            {districts.length > 3 && !showAllDistricts && (
              <button
                onClick={() => setShowAllDistricts(true)}
                id="show-all-districts"
                className="btn-secondary hidden sm:flex"
              >
                {t('home.see_all', { count: districts.length })} <ArrowIcon size={15} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingDistricts
              ? Array(3).fill(0).map((_, i) => <SkeletonDistrictCard key={i} />)
              : visibleDistricts.map((district, i) => (
                <DistrictCard key={district._id} district={district} index={i} />
              ))
            }
          </div>

          {!loadingDistricts && districts.length > 3 && !showAllDistricts && (
            <div className="text-center mt-8">
              <button
                onClick={() => setShowAllDistricts(true)}
                id="load-more-districts"
                className="btn-secondary"
              >
                {t('home.load_more', { count: districts.length - 3 })}
                <ChevronDown size={16} />
              </button>
            </div>
          )}

          {showAllDistricts && districts.length > 3 && (
            <div className="text-center mt-8">
              <button
                onClick={() => setShowAllDistricts(false)}
                className="btn-ghost text-sm"
              >
                {t('home.show_less')}
              </button>
            </div>
          )}

          {!loadingDistricts && districts.length === 0 && (
            <div className="text-center py-16">
              <Building2 size={48} className="text-dark-300 dark:text-dark-600 mx-auto mb-4" />
              <p className="text-dark-500 dark:text-dark-400">{t('home.no_districts')}</p>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-r from-primary-500 to-primary-700">
        <div className="page-container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display font-bold text-3xl text-white mb-3">
              {t('home.cta_title')}
            </h2>
            <p className="text-primary-100 mb-8 max-w-md mx-auto">
              {t('home.cta_subtitle')}
            </p>
            <Link
              to="/search"
              id="cta-search"
              className="inline-flex items-center gap-2 bg-white text-primary-600 hover:bg-primary-50 font-bold px-8 py-3.5 rounded-xl transition-all duration-200 hover:shadow-lg"
            >
              {t('home.cta_btn')}
              <ArrowIcon size={18} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
