"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { type Locale, locales, t as rawT } from "@/lib/i18n";

interface LocaleContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("pt-BR");

  useEffect(() => {
    const stored = localStorage.getItem("ff-locale") as Locale | null;
    if (stored && (locales as readonly string[]).includes(stored)) {
      setLocaleState(stored);
    }
  }, []);

  function setLocale(l: Locale) {
    setLocaleState(l);
    localStorage.setItem("ff-locale", l);
    // Atualiza o atributo lang do HTML para acessibilidade e SEO
    document.documentElement.lang = l;
  }

  const t = (key: string) => rawT(locale, key);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}
