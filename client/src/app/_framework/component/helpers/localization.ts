import translationsJson from '../../../../../public/translations.json';
type LanguageCode = 'en' | 'ru';

export class Localization {
  private static language: LanguageCode = 'en';

  static setLanguage(ISO2: LanguageCode) {
    this.language = ISO2;
  }

  private static translations: {
    [key: string]: { [key in LanguageCode]: string };
  } = translationsJson;

  static getWord(key: string): string {
    const translation = this.translations[key];
    if (translation) {
      return translation[this.language] || key;
    } else {
      return key;
    }
  }
}
