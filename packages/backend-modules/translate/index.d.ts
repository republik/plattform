export interface TranslatedError extends Error {}

export function t(key: any, replacements?: any, emptyValue?: any): string
