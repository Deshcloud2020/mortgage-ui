export const AVAILABLE_LANGUAGES = {
  en: { name: "English", nativeName: "English", flag: "🇺🇸" },
  bn: { name: "Bengali", nativeName: "বাংলা", flag: "🇧🇩" },
  es: { name: "Spanish", nativeName: "español", flag: "🇪🇸" },
  fr: { name: "French", nativeName: "French", flag: "🇫🇷" }
} as const;

export type LanguageCode = keyof typeof AVAILABLE_LANGUAGES;

export const getLanguageName = (code: string): string => {
  return AVAILABLE_LANGUAGES[code as LanguageCode]?.nativeName || code;
};
