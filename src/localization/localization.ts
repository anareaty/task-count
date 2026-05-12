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
    let locale = window.localStorage.language || "en"
    if (locale && typeof locale == "string" && locales[locale]) this.currentLocale = locale;
  }

  t(key: string): string {
    const translation = locales[this.currentLocale]?.[key] || locales['en']![key] || key;
    return translation;
  }
}

export const i18n = new LocalizationService();