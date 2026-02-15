import React, { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { I18n } from 'i18n-js';
import it from './values/it';
import en from './values/en';
import dayjs from 'dayjs';
import 'dayjs/locale/it';
import { useStorage } from '../contexts/StorageProvider/useStorage';
import { StorageKeys } from '../services';
import { getLocales } from 'expo-localization';

export const IT = 'it';
export const EN = 'en';
export const languages = { it, en };
export const managedLanguages = [IT, EN] as const;

const i18n = new I18n(languages);

/**
 * These types are created in base of:
 * https://stackoverflow.com/questions/58434389/typescript-deep-keyof-of-a-nested-object
 * In case you want IDE helps us by one key per time, remove the "1" from "Prev" type, or add 2, 3... etc to add other
 * deepness search
 */

type Prev = [never, 1];

type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}${'' extends P ? '' : '.'}${P}`
    : never
  : never;

type Paths<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends object
    ? {
        [K in keyof T]-?: K extends string | number
          ? `${K}` | Join<K, Paths<T[K], Prev[D]>>
          : never;
      }[keyof T]
    : '';

export type LanguagesType = keyof typeof languages;
export type LocalizationKeys = keyof typeof it;
export type TranslationKeys = Paths<typeof it>;
export type CallbackTranslation = (
  scope: Paths<typeof it>,
  options?: Record<string, unknown>
) => string;
export type CallbackSetTranslation = (language: LanguagesType) => void;

export const localeManager = (
  scope: Paths<typeof it>,
  newOptions?: Record<string, unknown>
): string => {
  const options = newOptions || { locale: IT };
  return i18n.t(scope, options || {});
};

interface LocalizationContextProps {
  t: CallbackTranslation;
  locale: LanguagesType;
  setLocale: CallbackSetTranslation;
}

interface LocalizationProviderProps {
  preferredLanguage?: LanguagesType;
  children: ReactNode;
}

export const LocalizationContext = createContext<LocalizationContextProps>({
  t: (scope, options = {}) => i18n.t(scope, { IT, ...options }),
  locale: IT,
  setLocale: () => {},
});

export const LocalizationProvider: React.FC<LocalizationProviderProps> = ({
  preferredLanguage = IT,
  children,
}) => {
  const [locale, setLocale] = useState<LanguagesType>(preferredLanguage);
  const t = useMemo((): CallbackTranslation => {
    return (scope, options) => i18n.t(scope, { locale, ...options });
  }, [locale]);
  const storage = useStorage();

  const updateLocale = useCallback(
    (language: LanguagesType) => {
      i18n.locale = language;
      dayjs.locale(language);
      setLocale(language);
      storage.setItem(StorageKeys.AppLanguage, language);
    },
    [storage]
  );

  const setAppLocale = useCallback(
    (language: LanguagesType) => {
      updateLocale(language);
    },
    [updateLocale]
  );

  useEffect(() => {
    const appLanguage = storage.getString(StorageKeys.AppLanguage);
    const phoneLanguage = getLocales()[0].languageCode;
    const isLanguageSupported = managedLanguages.includes(phoneLanguage as LanguagesType);
    const language = appLanguage ?? (isLanguageSupported ? phoneLanguage : preferredLanguage);
    setAppLocale(language as LanguagesType);
  }, [preferredLanguage, setAppLocale, storage]);

  return (
    <LocalizationContext.Provider
      value={{
        t,
        locale,
        setLocale: setAppLocale,
      }}>
      {children}
    </LocalizationContext.Provider>
  );
};
