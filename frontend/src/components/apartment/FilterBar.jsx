import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { districtAPI } from '../../api/axios';

const FilterBar = ({ onFilterChange, initialFilters = {} }) => {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [districts, setDistricts] = useState([]);
  const [expanded, setExpanded] = useState(false);

  const [filters, setFilters] = useState({
    search: initialFilters.search || searchParams.get('q') || '',
    districtId: initialFilters.districtId || '',
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || '',
    sort: initialFilters.sort || 'newest',
    gender: initialFilters.gender || '',
    available: initialFilters.available || '',
  });

  useEffect(() => {
    districtAPI.getAll().then((res) => setDistricts(res.data.data || [])).catch(() => {});
  }, []);

  const handleChange = (key, value) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    onFilterChange(updated);
  };

  const clearFilters = () => {
    const reset = { search: '', districtId: '', minPrice: '', maxPrice: '', sort: 'newest', gender: '', available: '' };
    setFilters(reset);
    onFilterChange(reset);
  };

  const hasActiveFilters = Object.entries(filters).some(([k, v]) => v && !(k === 'sort' && v === 'newest'));

  return (
    <div className="card p-4 mb-6">
      {/* Top row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={16}
            className={`absolute top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none ${
              isRTL ? 'right-3' : 'left-3'
            }`}
          />
          <input
            id="filter-search"
            type="text"
            placeholder={t('filter.search_placeholder')}
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className={`input ${isRTL ? 'pr-9' : 'pl-9'}`}
          />
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            id="filter-sort"
            value={filters.sort}
            onChange={(e) => handleChange('sort', e.target.value)}
            className={`input appearance-none cursor-pointer min-w-[180px] ${
              isRTL ? 'pl-9 pr-4' : 'pr-9 pl-4'
            }`}
          >
            <option value="newest">{t('filter.newest')}</option>
            <option value="price_asc">{t('filter.price_asc')}</option>
            <option value="price_desc">{t('filter.price_desc')}</option>
          </select>
          <ChevronDown
            size={14}
            className={`absolute top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none ${
              isRTL ? 'left-3' : 'right-3'
            }`}
          />
        </div>

        {/* Toggle filters */}
        <button
          id="toggle-advanced-filters"
          onClick={() => setExpanded(!expanded)}
          className={`btn-secondary gap-2 ${expanded ? 'border-primary-400 text-primary-500' : ''}`}
        >
          <SlidersHorizontal size={15} />
          {t('filter.filters_btn')}
          {hasActiveFilters && (
            <span className="bg-primary-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              ●
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button onClick={clearFilters} id="clear-filters" className="btn-ghost text-red-500 hover:text-red-600">
            <X size={16} />
            {t('filter.clear')}
          </button>
        )}
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-dark-100 dark:border-dark-700 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* District */}
          <div className="relative">
            <label className="label">{t('filter.district_label')}</label>
            <select
              id="filter-district"
              value={filters.districtId}
              onChange={(e) => handleChange('districtId', e.target.value)}
              className="input appearance-none"
            >
              <option value="">{t('filter.all_districts')}</option>
              {districts.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Min Price */}
          <div>
            <label className="label">{t('filter.min_price')}</label>
            <input
              id="filter-min-price"
              type="number"
              placeholder="0"
              value={filters.minPrice}
              onChange={(e) => handleChange('minPrice', e.target.value)}
              className="input"
              min="0"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="label">{t('filter.max_price')}</label>
            <input
              id="filter-max-price"
              type="number"
              placeholder={t('filter.any')}
              value={filters.maxPrice}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
              className="input"
              min="0"
            />
          </div>

          {/* Gender */}
          <div className="relative">
            <label className="label">{t('filter.gender_label')}</label>
            <select
              id="filter-gender"
              value={filters.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="input appearance-none"
            >
              <option value="">{t('filter.any')}</option>
              <option value="male">{t('filter.male_only')}</option>
              <option value="female">{t('filter.female_only')}</option>
            </select>
          </div>

          {/* Availability */}
          <div className="relative">
            <label className="label">{t('filter.availability_label')}</label>
            <select
              id="filter-available"
              value={filters.available}
              onChange={(e) => handleChange('available', e.target.value)}
              className="input appearance-none"
            >
              <option value="">{t('filter.all')}</option>
              <option value="true">{t('filter.available')}</option>
              <option value="false">{t('filter.unavailable')}</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
