import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const ComparisonContext = createContext(null);

export const ComparisonProvider = ({ children }) => {
  const { t } = useTranslation();
  const [compareList, setCompareList] = useState(() => {
    try {
      const saved = localStorage.getItem('apartment_comparison');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('apartment_comparison', JSON.stringify(compareList));
  }, [compareList]);

  const toggleCompare = (apartment) => {
    setCompareList((prev) => {
      const exists = prev.some((apt) => apt._id === apartment._id);
      
      if (exists) {
        return prev.filter((apt) => apt._id !== apartment._id);
      }
      
      if (prev.length >= 4) {
        toast.error(t('compare.limit_toast'), { id: 'compare-limit' });
        return prev;
      }
      
      return [...prev, apartment];
    });
  };

  const removeFromCompare = (apartmentId) => {
    setCompareList((prev) => prev.filter((apt) => apt._id !== apartmentId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isComparing = (apartmentId) => {
    return compareList.some((apt) => apt._id === apartmentId);
  };

  return (
    <ComparisonContext.Provider
      value={{
        compareList,
        toggleCompare,
        removeFromCompare,
        clearCompare,
        isComparing,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};
