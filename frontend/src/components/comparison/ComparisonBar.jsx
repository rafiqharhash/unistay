import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Scale, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useComparison } from '../../context/ComparisonContext';

const ComparisonBar = () => {
  const { t } = useTranslation();
  const { compareList, removeFromCompare, clearCompare } = useComparison();

  if (compareList.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none"
      >
        <div className="page-container max-w-4xl">
          <div className="bg-white/90 dark:bg-dark-800/95 backdrop-blur-xl border border-dark-200 dark:border-dark-700 shadow-2xl rounded-2xl p-4 pointer-events-auto flex flex-col md:flex-row items-center gap-4">
            
            {/* Header / Info */}
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                <Scale size={20} className="text-primary-500" />
              </div>
              <div className="hidden sm:block">
                <h3 className="font-display font-semibold text-dark-900 dark:text-white text-sm">
                  {compareList.length === 1 
                    ? t('compare.bar_title', { count: 1 })
                    : t('compare.bar_title_other', { count: compareList.length })
                  }
                </h3>
                <p className="text-xs text-dark-500 dark:text-dark-400">
                  {compareList.length}/4 selected
                </p>
              </div>
            </div>

            {/* Selected Apartments */}
            <div className="flex-1 w-full flex items-center justify-start md:justify-center gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
              {compareList.map((apt) => (
                <div 
                  key={apt._id} 
                  className="relative flex-shrink-0 w-24 sm:w-32 h-12 bg-dark-50 dark:bg-dark-900 rounded-lg border border-dark-100 dark:border-dark-700 flex items-center p-1 group"
                >
                  <div className="w-10 h-10 rounded-md bg-dark-200 dark:bg-dark-800 overflow-hidden flex-shrink-0">
                    {apt.images?.[0] ? (
                      <img src={apt.images[0]} alt={apt.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 size={14} className="text-dark-400" />
                      </div>
                    )}
                  </div>
                  <div className="ml-2 mr-2 min-w-0 flex-1 hidden sm:block">
                    <p className="text-xs font-medium text-dark-800 dark:text-dark-200 truncate">
                      #{apt.apartmentId}
                    </p>
                  </div>
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCompare(apt._id)}
                    aria-label={t('compare.bar_remove_aria', { title: apt.apartmentId })}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-sm transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {/* Empty Slots */}
              {Array.from({ length: 4 - compareList.length }).map((_, i) => (
                <div 
                  key={`empty-${i}`} 
                  className="flex-shrink-0 w-24 sm:w-32 h-12 rounded-lg border-2 border-dashed border-dark-200 dark:border-dark-700 flex items-center justify-center opacity-50"
                >
                  <span className="text-xs text-dark-400 hidden sm:block">{t('compare.add_slot')}</span>
                  <Plus size={16} className="text-dark-400 sm:hidden" />
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 flex items-center gap-2 w-full md:w-auto">
              <button 
                onClick={clearCompare}
                className="btn-ghost flex-1 md:flex-none text-xs px-3"
              >
                {t('compare.bar_clear')}
              </button>
              <Link 
                to="/compare" 
                className="btn-primary flex-1 md:flex-none text-sm py-2 px-5 whitespace-nowrap"
              >
                {t('compare.bar_compare_btn')}
              </Link>
            </div>

          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Simple Plus icon component since it wasn't imported in this file originally
const Plus = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default ComparisonBar;
