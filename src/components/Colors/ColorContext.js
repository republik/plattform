import React, { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import colors, { variableColorKeys } from '../../theme/colors'
import memoize from 'lodash/memoize'

const createScheme = specificColors => {
  const colorScheme = {
    ...colors,
    ...specificColors
  }

  const accessCSSColor = colorScheme.cssColors
    ? color => colorScheme.cssColors[color] || colorScheme[color] || color
    : color => colorScheme[color] || color

  const { mappings = {} } = colorScheme

  const getCSSColor = (color, mappingName) => {
    const mapping = mappings[mappingName] || {}
    return accessCSSColor(mapping[color] || color)
  }

  const createColorRule = (attr, color, mappingName) => {
    return css({
      [attr]: getCSSColor(color, mappingName)
    })
  }

  return {
    ...colorScheme,
    set: memoize(createColorRule, (...args) => args.join('.')),
    getCSSColor
  }
}

const ColorContext = React.createContext(createScheme(colors.light))

const generateCSSColorDefinitions = colors => {
  return variableColorKeys
    .map(key => `--color-${key}: ${colors[key]};`)
    .join(' ')
}

// ensure only main colors are available via context
const reduceMainColors = (mapper = key => key) =>
  variableColorKeys.reduce((c, key) => {
    c[key] = mapper(key)
    return c
  }, {})

export const ColorContextProvider = ({
  colorSchemeKey = 'auto',
  root = false,
  children
}) => {
  // we initially assume browser support it
  // - e.g. during server side rendering
  const [CSSVarSupport, setCSSVarSupport] = useState(true)
  useEffect(() => {
    let support
    try {
      support =
        window.CSS &&
        window.CSS.supports &&
        window.CSS.supports('color', 'var(--color-test)')
    } catch (e) {}
    if (!support) {
      // but if can't confirm the support in the browser we turn it off
      setCSSVarSupport(false)
    }
  }, [])

  const colorValue = useMemo(() => {
    if (colorSchemeKey === 'auto') {
      return createScheme({
        ...(CSSVarSupport
          ? reduceMainColors(key => `var(--color-${key})`)
          : colors.light),
        cssColors: reduceMainColors(key => [
          colors.light[key],
          `var(--color-${key})`
        ])
      })
    }
    return createScheme(colors[colorSchemeKey])
  }, [colorSchemeKey, CSSVarSupport])

  return (
    <ColorContext.Provider value={colorValue}>
      {root && (
        <style
          key={colorSchemeKey}
          dangerouslySetInnerHTML={{
            __html:
              colorSchemeKey === 'auto'
                ? [
                    // default light
                    `html, body { background-color: ${colors.light.default}; color: ${colors.light.text}; }`,
                    `:root { ${generateCSSColorDefinitions(colors.light)} }`,
                    // dark via user preference
                    `html[data-user-color-scheme="dark"], html[data-user-color-scheme="dark"] body { background-color: ${colors.dark.default}; color: ${colors.dark.text}; }`,
                    `:root[data-user-color-scheme="dark"] { ${generateCSSColorDefinitions(
                      colors.dark
                    )} }`,
                    // os dark preference
                    `@media (prefers-color-scheme: dark) {`,
                    [
                      // auto dark via media query
                      `html, body { background-color: ${colors.dark.default}; color: ${colors.dark.text}; }`,
                      `:root { ${generateCSSColorDefinitions(colors.dark)} }`,
                      // light via user preference when os is dark
                      `html[data-user-color-scheme="light"], html[data-user-color-scheme="light"] body { background-color: ${colors.light.default}; color: ${colors.light.text}; }`,
                      `:root[data-user-color-scheme="light"] { ${generateCSSColorDefinitions(
                        colors.light
                      )} }`
                    ].join('\n'),
                    `}`
                  ].join('\n')
                : `html, body { background-color: ${colorValue.default}; color: ${colorValue.text}; }`
          }}
        />
      )}
      {children}
    </ColorContext.Provider>
  )
}

ColorContextProvider.propTypes = {
  colorSchemeKey: PropTypes.oneOf(['light', 'dark', 'auto']).isRequired
}

export default ColorContext
