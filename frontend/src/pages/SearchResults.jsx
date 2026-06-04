import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Building2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { apartmentAPI } from '../api/axios';
import ApartmentCard from '../components/apartment/ApartmentCard';
import FilterBar from '../components/apartment/FilterBar';
import SkeletonCard from '../components/common/SkeletonCard';
import Pagination from '../components/common/Pagination';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const initialQuery = searchParams.get('q') || '';
  const initialFeatured = searchParams.get('featured') || '';

  const [apartments, setApartments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: initialQuery,
    sort: 'newest',
    featured: initialFeatured,
  });

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  useEffect(() => {
    document.title = initialQuery
      ? `Search: "${initialQuery}" - UniStay`
      : 'Search Apartments - UniStay';
  }, [initialQuery]);

  const fetchApartments = useCallback(async (page = 1, activeFilters = filters) => {
    setLoading(true);
    try {
      const res = await apartmentAPI.getAll({ ...activeFilters, page, limit: 12 });
      setApartments(res.data.data || []);
      setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApartments(1, filters);
  }, []);

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

  const pageTitle = initialQuery
    ? t('search.results_for', { query: initialQuery })
    : initialFeatured
    ? t('search.featured_title')
    : t('search.all_title');

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-dark-100 dark:border-dark-700">
        <div className="page-container py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center">
              <Search size={18} className="text-primary-500" />
            </div>
            <h1 className="font-display font-bold text-2xl text-dark-900 dark:text-white">
              {pageTitle}
            </h1>
          </div>
          {!loading && (
            <p className="text-sm text-dark-500 dark:text-dark-400 ms-12">
              {t('search.results_other', { count: pagination.total })}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="page-container py-8">
        <FilterBar
          onFilterChange={handleFilterChange}
          initialFilters={{ search: initialQuery, sort: 'newest', featured: initialFeatured }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading
            ? Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : apartments.map((apt, i) => <ApartmentCard key={apt._id} apartment={apt} index={i} />)
          }
        </div>

        {!loading && apartments.length === 0 && (
          <div className="text-center py-20">
            <Building2 size={56} className="text-dark-300 dark:text-dark-600 mx-auto mb-4" />
            <h2 className="font-display font-semibold text-xl text-dark-700 dark:text-dark-300 mb-2">
              {t('search.no_results_title')}
            </h2>
            <p className="text-dark-500 dark:text-dark-400 text-sm mb-6">
              {t('search.no_results_subtitle')}
            </p>
            <Link to="/" className="btn-secondary">
              {t('search.browse_districts')}
            </Link>
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

export default SearchResults;
