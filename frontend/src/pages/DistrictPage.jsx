import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, MapPin, Building2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { districtAPI, apartmentAPI } from '../api/axios';
import ApartmentCard from '../components/apartment/ApartmentCard';
import FilterBar from '../components/apartment/FilterBar';
import SkeletonCard from '../components/common/SkeletonCard';
import Pagination from '../components/common/Pagination';

const DistrictPage = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [district, setDistrict] = useState(null);
  const [apartments, setApartments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ sort: 'newest' });
  const [currentPage, setCurrentPage] = useState(1);

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  useEffect(() => {
    districtAPI.getOne(id)
      .then((res) => {
        setDistrict(res.data.data);
        document.title = `${res.data.data.name} - UniStay`;
      })
      .catch(() => setError(t('district_page.not_found_title')));
  }, [id, t]);

  const fetchApartments = useCallback(async (page = 1, activeFilters = filters) => {
    setLoading(true);
    try {
      const res = await apartmentAPI.getAll({
        districtId: id,
        page,
        limit: 9,
        ...activeFilters,
      });
      setApartments(res.data.data || []);
      setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch {
      setError(t('district_page.not_found_title'));
    } finally {
      setLoading(false);
    }
  }, [id, filters, t]);

  useEffect(() => {
    fetchApartments(1, filters);
    setCurrentPage(1);
  }, [id]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    fetchApartments(1, newFilters);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchApartments(page, filters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error && !district) {
    return (
      <div className="page-container py-20 text-center">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h1 className="section-title mb-2">{t('district_page.not_found_title')}</h1>
        <p className="text-dark-500 mb-6">{error}</p>
        <Link to="/" className="btn-primary">{t('district_page.go_home')}</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-dark-100 dark:border-dark-700">
        <div className="page-container py-8">
          <Link to="/" className="btn-ghost mb-4 inline-flex" id="back-home">
            <BackIcon size={16} /> {t('district_page.back_home')}
          </Link>

          {district ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row sm:items-end gap-4"
            >
              {district.coverImage && (
                <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-lg">
                  <img src={district.coverImage} alt={district.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={14} className="text-primary-500" />
                  <span className="text-sm text-dark-500 dark:text-dark-400">
                    {t('district_page.district_label')}
                  </span>
                </div>
                <h1 className="font-display font-bold text-3xl text-dark-900 dark:text-white">
                  {district.name}
                </h1>
                {district.description && (
                  <p className="text-dark-500 dark:text-dark-400 mt-1 text-sm">{district.description}</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="flex items-center gap-1.5 text-dark-500 dark:text-dark-400">
                    <Building2 size={14} className="text-primary-500" />
                    {t('district_page.total_apartments_other', { count: district.apartmentCount ?? 0 })}
                  </span>
                  {district.availableCount > 0 && (
                    <span className="badge-available">
                      {district.availableCount} {t('district_page.available')}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-2">
              <div className="shimmer h-8 rounded-lg w-48" />
              <div className="shimmer h-4 rounded-lg w-64" />
            </div>
          )}

          {district?.googleMapsUrl && (
            <div className="mt-8 rounded-2xl overflow-hidden border border-dark-100 dark:border-dark-700 h-64 sm:h-80 shadow-sm">
              <iframe
                src={district.googleMapsUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="District location on Google Maps"
              />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="page-container py-8">
        <FilterBar onFilterChange={handleFilterChange} initialFilters={{ districtId: id, sort: 'newest' }} />

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-dark-500 dark:text-dark-400 mb-4">
            {t('district_page.results_other', { count: pagination.total })}
          </p>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array(9).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : apartments.map((apt, i) => <ApartmentCard key={apt._id} apartment={apt} index={i} />)
          }
        </div>

        {!loading && apartments.length === 0 && (
          <div className="text-center py-16">
            <Building2 size={48} className="text-dark-300 dark:text-dark-600 mx-auto mb-4" />
            <h3 className="font-display font-semibold text-xl text-dark-700 dark:text-dark-300 mb-2">
              {t('district_page.no_apartments_title')}
            </h3>
            <p className="text-dark-500 dark:text-dark-400 text-sm">
              {t('district_page.no_apartments_subtitle')}
            </p>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default DistrictPage;
