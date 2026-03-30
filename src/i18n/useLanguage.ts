import { translations, Language, TranslationKey } from "./translations";

function detectLanguage(): Language {
  const browserLang = navigator.language || (navigator as any).userLanguage || "en";
  return browserLang.startsWith("ru") ? "ru" : "en";
}

const currentLanguage = detectLanguage();

export function useLanguage() {
  const t = (key: TranslationKey): string => {
    return translations[currentLanguage][key] || translations.en[key] || key;
  };

  return { t, language: currentLanguage };
}
