'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Locale, SUPPORTED_LOCALES, TRANSLATIONS } from './translations';

const STORAGE_KEY = 'kds:locale';

function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en';
  const langs = [navigator.language, ...(navigator.languages ?? [])];
  for (const raw of langs) {
    const code = raw.toLowerCase().slice(0, 2);
    if ((SUPPORTED_LOCALES as string[]).includes(code)) return code as Locale;
  }
  return 'en';
}

function readStoredOverride(): Locale | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v && (SUPPORTED_LOCALES as string[]).includes(v) ? (v as Locale) : null;
  } catch {
    return null;
  }
}

interface LocaleContextValue {
  /** Resolved locale currently used for rendering. */
  locale: Locale;
  /** User override stored in localStorage; null means "follow browser". */
  override: Locale | null;
  /** Set the override locale (or null to follow browser). */
  setOverride: (locale: Locale | null) => void;
  /** Translate a key. Falls back to the key itself if missing. */
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // Use a stable initial value so SSR and the first client render match.
  // We hydrate the real override + browser detection inside an effect.
  const [override, setOverrideState] = useState<Locale | null>(null);
  const [browserLocale, setBrowserLocale] = useState<Locale>('en');

  useEffect(() => {
    setOverrideState(readStoredOverride());
    setBrowserLocale(detectBrowserLocale());
  }, []);

  const setOverride = useCallback((next: Locale | null) => {
    setOverrideState(next);
    if (typeof window === 'undefined') return;
    try {
      if (next) window.localStorage.setItem(STORAGE_KEY, next);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore quota / disabled storage */
    }
  }, []);

  const locale: Locale = override ?? browserLocale;

  const t = useCallback(
    (key: string): string => {
      const dict = TRANSLATIONS[locale];
      const v = dict[key];
      if (typeof v === 'string') return v;
      // Fallback chain: en, then the raw key.
      return TRANSLATIONS.en[key] ?? key;
    },
    [locale]
  );

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, override, setOverride, t }),
    [locale, override, setOverride, t]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useTranslation(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useTranslation must be used inside <LocaleProvider>');
  return ctx;
}
