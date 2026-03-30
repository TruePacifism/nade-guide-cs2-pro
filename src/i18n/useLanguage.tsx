import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { translations, Language, TranslationKey } from "./translations";

const STORAGE_KEY = "language";

function isLanguage(value: string): value is Language {
  return value in translations;
}

function detectLanguage(): Language {
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && isLanguage(stored)) {
        return stored;
      }
    } catch {
      // Ignore storage errors and fall back to browser language.
    }

    const browserLang = navigator.language || (navigator as any).userLanguage || "en";
    return browserLang.startsWith("ru") ? "ru" : "en";
  }

  return "en";
}

type LanguageContextValue = {
  t: (key: TranslationKey) => string;
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = React.createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => detectLanguage());

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Ignore storage errors.
    }
  }, [language]);

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[language][key] || translations.en[key] || key;
    },
    [language]
  );

  const value = useMemo(
    () => ({
      t,
      language,
      setLanguage,
    }),
    [t, language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context) {
    return context;
  }

  const language = detectLanguage();
  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return {
    t,
    language,
    setLanguage: () => {},
  };
}
