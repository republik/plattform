export interface TranslatedError extends Error {}

export interface TranslationFromatter {
  (key: any, replacements?: any, emptyValue?: any): string
  pluralize(key: any, replacements?: any, emptyValue?: any): string
}

export const t: TranslationFromatter
