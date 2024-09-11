export interface TranslatedError extends Error {}

export function t(string: any): {
  (key: any, replacements: any, emptyValue: any): any
  first(keys: any, replacements: any, emptyValue: any): any
  pluralize(baseKey: any, replacements: any, emptyValue: any): any
}
