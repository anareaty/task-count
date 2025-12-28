import { getLanguage } from 'obsidian';
import en from 'localization/locales/en';
import ru from 'localization/locales/ru';


type Locale = Record<string, string>

const locales: Record<string, Locale> = {
  en,
  ru
};

export class LocalizationService {
  private currentLocale: string = 'en';

  setLocale() {
    let locale: string = "en"
		if (getLanguage) {
      locale = getLanguage();
    } else {
      // Fallback for the older version of Obsidian
      locale = window.localStorage.language
    }
    if (locale && locales[locale]) this.currentLocale = locale;
  }

  t(key: string): string {
    const translation = locales[this.currentLocale]?.[key] || locales['en']![key] || key;
    return translation;
  }
}

export const i18n = new LocalizationService();