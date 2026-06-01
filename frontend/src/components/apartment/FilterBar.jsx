import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { districtAPI } from '../../api/axios';

const FilterBar = ({ onFilterChange, initialFilters = {} }) => {
  const [searchParams] = useSearchParams();
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
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            id="filter-search"
            type="text"
            placeholder="Search by Apartment ID..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="input pl-9"
          />
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            id="filter-sort"
            value={filters.sort}
            onChange={(e) => handleChange('sort', e.target.value)}
            className="input pr-9 appearance-none cursor-pointer min-w-[160px]"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
        </div>

        {/* Toggle filters */}
        <button
          id="toggle-advanced-filters"
          onClick={() => setExpanded(!expanded)}
          className={`btn-secondary gap-2 ${expanded ? 'border-primary-400 text-primary-500' : ''}`}
        >
          <SlidersHorizontal size={15} />
          Filters
          {hasActiveFilters && (
            <span className="bg-primary-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              ●
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button onClick={clearFilters} id="clear-filters" className="btn-ghost text-red-500 hover:text-red-600">
            <X size={16} />
            Clear
          </button>
        )}
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-dark-100 dark:border-dark-700 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* District */}
          <div className="relative">
            <label className="label">District</label>
            <select
              id="filter-district"
              value={filters.districtId}
              onChange={(e) => handleChange('districtId', e.target.value)}
              className="input appearance-none"
            >
              <option value="">All Districts</option>
              {districts.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Min Price */}
          <div>
            <label className="label">Min Price ($)</label>
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
            <label className="label">Max Price ($)</label>
            <input
              id="filter-max-price"
              type="number"
              placeholder="Any"
              value={filters.maxPrice}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
              className="input"
              min="0"
            />
          </div>

          {/* Gender */}
          <div className="relative">
            <label className="label">Gender</label>
            <select
              id="filter-gender"
              value={filters.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="input appearance-none"
            >
              <option value="">Any</option>
              <option value="male">Male Only</option>
              <option value="female">Female Only</option>
            </select>
          </div>

          {/* Availability */}
          <div className="relative">
            <label className="label">Availability</label>
            <select
              id="filter-available"
              value={filters.available}
              onChange={(e) => handleChange('available', e.target.value)}
              className="input appearance-none"
            >
              <option value="">All</option>
              <option value="true">Available</option>
              <option value="false">Unavailable</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
