import { Scale, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useComparison } from '../../context/ComparisonContext';

const CompareButton = ({ apartment, className = '' }) => {
  const { t } = useTranslation();
  const { isComparing, toggleCompare } = useComparison();
  
  const isSelected = isComparing(apartment._id);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare(apartment);
  };

  return (
    <button
      onClick={handleClick}
      aria-label={isSelected ? t('compare.btn_aria_remove') : t('compare.btn_aria_add')}
      className={`absolute top-3 left-3 right-auto z-10 p-2 rounded-xl backdrop-blur-md transition-all duration-200 shadow-sm ${
        isSelected
          ? 'bg-primary-500 text-white'
          : 'bg-white/80 text-dark-500 hover:bg-white hover:text-primary-500 hover:shadow-md dark:bg-dark-900/80 dark:text-dark-300 dark:hover:bg-dark-800 dark:hover:text-primary-400'
      } ${className}`}
      // RTL is handled by index.css (.absolute.left-3 etc overrides)
    >
      {isSelected ? <Check size={18} /> : <Scale size={18} />}
    </button>
  );
};

export default CompareButton;
