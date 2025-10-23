import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const loadTranslations = async (lng: string) => {
  const translations = await import(`./locales/${lng}.json`);
  return translations.default;
};

i18n
  .use(initReactI18next)
  .init({
    resources: {},
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

loadTranslations('en').then((translations) => {
  i18n.addResourceBundle('en', 'translation', translations, true, true);
});

export default i18n;
