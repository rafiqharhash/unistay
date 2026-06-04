import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import i18n from '../i18n/index';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('unistay_language') || 'en';
  });

  const isRTL = language === 'ar';

  // Apply language to the document on mount and on change
  const applyLanguage = useCallback((lang) => {
    const root = document.documentElement;
    const isArabic = lang === 'ar';

    root.setAttribute('lang', lang);
    root.setAttribute('dir', isArabic ? 'rtl' : 'ltr');

    // Swap the font class on the body for Arabic
    if (isArabic) {
      document.body.classList.add('font-arabic');
    } else {
      document.body.classList.remove('font-arabic');
    }
  }, []);

  // Apply on initial mount
  useEffect(() => {
    applyLanguage(language);
  }, [language, applyLanguage]);

  const setLanguage = useCallback((lang) => {
    localStorage.setItem('unistay_language', lang);
    i18n.changeLanguage(lang);
    setLanguageState(lang);
    applyLanguage(lang);
  }, [applyLanguage]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
