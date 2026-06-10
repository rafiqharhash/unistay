import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale, ArrowLeft, ArrowRight, Settings2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { useComparison } from '../context/ComparisonContext';
import ComparisonTable from '../components/comparison/ComparisonTable';

const ApartmentComparison = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { compareList, clearCompare } = useComparison();
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  useEffect(() => {
    document.title = `${t('compare.page_title')} - UniStay`;
  }, [t]);

  if (compareList.length === 0) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-dark-900 flex items-center justify-center p-4 animate-fade-in">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Scale size={48} className="text-primary-500" />
          </div>
          <h1 className="font-display font-bold text-2xl text-dark-900 dark:text-white mb-2">
            {t('compare.empty_title')}
          </h1>
          <p className="text-dark-500 dark:text-dark-400 mb-8">
            {t('compare.empty_subtitle')}
          </p>
          <Link to="/" className="btn-primary justify-center w-full sm:w-auto">
            {t('compare.empty_btn')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-900 animate-fade-in pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-dark-100 dark:border-dark-700 sticky top-0 z-20 shadow-sm">
        <div className="page-container py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Link to="/" className="btn-ghost p-1.5 -ml-1.5" aria-label={t('common.go_home')}>
                  <BackIcon size={18} />
                </Link>
                <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                  <Scale size={16} className="text-primary-500" />
                </div>
                <h1 className="font-display font-bold text-xl sm:text-2xl text-dark-900 dark:text-white">
                  {t('compare.page_title')}
                </h1>
              </div>
              <p className="text-sm text-dark-500 dark:text-dark-400 ml-1 sm:ml-12">
                {t('compare.page_subtitle')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Toggle Differences */}
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={showDifferencesOnly}
                    onChange={(e) => setShowDifferencesOnly(e.target.checked)}
                  />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${showDifferencesOnly ? 'bg-primary-500' : 'bg-dark-200 dark:bg-dark-600'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showDifferencesOnly ? 'transform translate-x-4' : ''} ${isRTL && showDifferencesOnly ? 'transform -translate-x-4' : ''}`}></div>
                </div>
                <span className="text-sm font-medium text-dark-700 dark:text-dark-300 select-none group-hover:text-primary-500 transition-colors">
                  {t('compare.toggle_differences')}
                </span>
              </label>

              <div className="w-px h-6 bg-dark-200 dark:bg-dark-700 hidden sm:block"></div>

              <button
                onClick={clearCompare}
                className="btn-ghost text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                {t('compare.bar_clear')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="page-container py-8">
        <ComparisonTable 
          apartments={compareList} 
          showDifferencesOnly={showDifferencesOnly} 
        />
        
        {showDifferencesOnly && (
          <p className="text-center text-sm text-dark-400 mt-4 flex items-center justify-center gap-2">
            <Settings2 size={14} />
            {t('compare.differences_only_hint')}
          </p>
        )}
      </div>
    </div>
  );
};

export default ApartmentComparison;
