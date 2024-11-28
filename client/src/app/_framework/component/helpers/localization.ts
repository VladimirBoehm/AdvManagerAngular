import translationsJson from '../../../../../public/translations.json';
type LanguageCode = 'en' | 'ru';

export class Localization {
  private static language: LanguageCode = 'en';

  static setLanguage(ISO2language: string) {
    if (['ru', 'uk', 'be'].includes(ISO2language)) {
      this.language = 'ru';
    } else {
      this.language = 'en';
    }
  }

  static getFormattedWord(key: string, params: { [key: string]: any }): string {
    let word = this.getWord(key);
    for (const param in params) {
      word = word.replace(`{${param}}`, params[param]);
    }
    return word;
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
