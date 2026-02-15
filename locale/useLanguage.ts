import { useContext } from 'react';
import {
  CallbackSetTranslation,
  CallbackTranslation,
  LanguagesType,
  LocalizationContext,
} from './localization.provider';

export const useLanguage = (): [CallbackTranslation, CallbackSetTranslation, LanguagesType] => {
  const { t, setLocale, locale } = useContext(LocalizationContext);
  return [t, setLocale, locale];
};
