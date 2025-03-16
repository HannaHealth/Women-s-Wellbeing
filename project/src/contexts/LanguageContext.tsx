import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import enTranslations from '../locales/en.json';
import esTranslations from '../locales/es.json';
import frTranslations from '../locales/fr.json';

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      es: { translation: esTranslations },
      fr: { translation: frTranslations },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, options?: object) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  useEffect(() => {
    // Try to get stored language or use browser language
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage) {
      changeLanguage(storedLanguage);
    } else {
      const browserLang = navigator.language.split('-')[0];
      if (['en', 'es', 'fr'].includes(browserLang)) {
        changeLanguage(browserLang);
      }
    }
  }, []);

  const value = {
    language,
    setLanguage: (lang: string) => {
      changeLanguage(lang);
      localStorage.setItem('language', lang);
    },
    t: (key: string, options?: object) => i18n.t(key, options || {}),
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};