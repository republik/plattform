import { ReactNode } from 'react'

type Translations = {
  key: string
  value: string
}[]
type Replacements = { [key: string]: ReactNode }

export type FormatterFunction = (
  key: string,
  replacements?: Replacements,
  missingValue?: string,
) => string

type FirstFunction = (
  keys: string[],
  replacements?: Replacements,
  missingValue?: string,
) => string

type PluralizeFunction = (
  baseKey: string,
  replacements?: Replacements,
  missingValue?: string,
) => string

type ElementsFunction = (
  key: string,
  replacements?: Replacements,
  missingValue?: string,
) => ReactNode

type FirstElementsFunction = (
  key: string | string[],
  replacements?: Replacements,
  missingValue?: string,
) => ReactNode

type CreateFormatter = (translations: Translations) => Formatter

export type TranslationFunc = FormatterFunction &
  FirstFunction &
  PluralizeFunction &
  ElementsFunction &
  FirstElementsFunction

export type Formatter = FormatterFunction & {
  elements: ElementsFunction
  first: FirstFunction & { elements?: FirstElementsFunction }
  pluralize: PluralizeFunction & { elements?: ElementsFunction }
}

export const replaceKeys = (message, replacements) => {
  let withReplacements = message
  Object.keys(replacements).forEach((replacementKey) => {
    withReplacements = withReplacements.replace(
      `{${replacementKey}}`,
      replacements[replacementKey],
    )
  })
  return withReplacements
}

export const createPlaceholderFormatter = (placeholder = '') => {
  const formatter = () => placeholder
  formatter.elements = () => [placeholder]
  formatter.first = formatter
  formatter.first.elements = formatter.elements
  formatter.pluralize = formatter
  formatter.pluralize.elements = formatter.elements
  return formatter
}

export const createFormatter: CreateFormatter = (translations) => {
  const index = translations.reduce((accumulator, translation) => {
    accumulator[translation.key] = translation.value
    return accumulator
  }, {})

  const formatter = <Formatter>function (key, replacements, missingValue) {
    let message =
      index[key] || (missingValue !== undefined ? missingValue : `TK(${key})`)
    if (replacements) {
      message = replaceKeys(message, replacements)
    }
    return message
  }

  const firstKey = (keys) =>
    keys.find((k) => index[k] !== undefined) || keys[keys.length - 1]
  const pluralizationKeys = (baseKey, replacements) => [
    `${baseKey}/${replacements.count}`,
    `${baseKey}/other`,
  ]

  formatter.first = (keys, replacements, missingValue) => {
    return formatter(firstKey(keys), replacements, missingValue)
  }
  formatter.pluralize = (baseKey, replacements, missingValue) => {
    return formatter.first(
      pluralizationKeys(baseKey, replacements),
      replacements,
      missingValue,
    )
  }

  const createReplacementReducer = (replacements) => (r, part) => {
    if (part[0] === '{') {
      r.push(replacements[part.slice(1, -1)] || '')
    } else {
      r.push(part)
    }
    return r
  }
  formatter.elements = (key, replacements, missingValue) => {
    return formatter(key, undefined, missingValue)
      .split(/(\{[^{}]+\})/g)
      .filter(Boolean)
      .reduce(createReplacementReducer(replacements), [])
  }
  formatter.first.elements = (keys, replacements, missingValue) => {
    return formatter.elements(firstKey(keys), replacements, missingValue)
  }
  formatter.pluralize.elements = (baseKey, replacements, missingValue) => {
    return formatter.first.elements(
      pluralizationKeys(baseKey, replacements),
      replacements,
      missingValue,
    )
  }

  return formatter
}
