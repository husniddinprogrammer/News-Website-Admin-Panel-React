import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import uzLatin from './locales/uz-latin.json';
import uzCyrillic from './locales/uz-cyrillic.json';

const savedLang = localStorage.getItem('lang') || 'uz-latin';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'uz-latin': { translation: uzLatin },
      'uz-cyrillic': { translation: uzCyrillic },
    },
    lng: savedLang,
    fallbackLng: 'uz-latin',
    interpolation: { escapeValue: false },
  });

export default i18n;
