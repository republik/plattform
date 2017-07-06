// exports instead of named export for graphql server

export interface Formatter {
  (
    key: string,
    replacements?: string,
    emptyValue?: string
  ): string
  first?: any
  pluralize?: any
  elements?: any
}

export const getFormatter = (translations: any) => {
  if (!Array.isArray(translations)) {
    const emptyFormatter: Formatter = () => ''
    emptyFormatter.first = emptyFormatter
    emptyFormatter.pluralize = emptyFormatter
    return emptyFormatter
  }

  const index = translations.reduce(
    (accumulator, translation) => {
      accumulator[translation.key] = translation.value
      return accumulator
    },
    {}
  )
  const formatter: Formatter = (
    key: any,
    replacements: any,
    emptyValue: any
  ) => {
    let message =
      index[key] ||
      (emptyValue !== undefined
        ? emptyValue
        : `[missing translation '${key}']`)
    if (replacements) {
      Object.keys(replacements).forEach(replacementKey => {
        message = message.replace(
          `{${replacementKey}}`,
          replacements[replacementKey]
        )
      })
    }
    return message
  }
  const first = (formatter.first = (
    keys: any,
    replacements: any,
    emptyValue: any
  ) => {
    const key =
      keys.find((k: string) => index[k] !== undefined) ||
      keys[keys.length - 1]
    return formatter(key, replacements, emptyValue)
  })
  formatter.pluralize = (
    baseKey: any,
    replacements: any,
    emptyValue: any
  ) => {
    return first(
      [
        `${baseKey}/${replacements.count}`,
        `${baseKey}/other`
      ],
      replacements,
      emptyValue
    )
  }

  formatter.elements = (
    key: any,
    replacements: any,
    emptyValue: any
  ) => {
    const replacementReducer = (r: any, part: any) => {
      if (part[0] === '{') {
        r.push(replacements[part.slice(1, -1)] || '')
      } else {
        r.push(part)
      }
      return r
    }
    return formatter(key, undefined, emptyValue)
      .split(/(\{[^{}]+\})/g)
      .filter(Boolean)
      .reduce(replacementReducer, [])
  }

  return formatter
}
