import React, { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import colors, { variableColorKeys } from '../../theme/colors'

const defaultColors = colors
const ColorContext = React.createContext(defaultColors)

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
      return {
        ...(CSSVarSupport
          ? reduceMainColors(key => `var(--color-${key})`)
          : colors.bright),
        cssColors: reduceMainColors(key => [
          colors.bright[key],
          `var(--color-${key})`
        ])
      }
    }
    return colors[colorSchemeKey]
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
                    // default bright
                    `html, body { background-color: ${colors.bright.default}; color: ${colors.bright.text}; }`,
                    `:root { ${generateCSSColorDefinitions(colors.bright)} }`,
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
                      // bright via user preference when os is dark
                      `html[data-user-color-scheme="bright"], html[data-user-color-scheme="bright"] body { background-color: ${colors.bright.default}; color: ${colors.bright.text}; }`,
                      `:root[data-user-color-scheme="bright"] { ${generateCSSColorDefinitions(
                        colors.bright
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
  colorSchemeKey: PropTypes.oneOf(['bright', 'dark', 'auto']).isRequired
}

export default ColorContext
