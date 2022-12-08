import React, { useEffect, useMemo, useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import colors from '../../theme/colors'
import memoize from 'lodash/memoize'

const getVariableColorKeys = (colors) =>
  Object.keys(colors.light).filter(
    (color) => colors.light[color] !== colors.dark[color],
  )

// identify all variable color keys
const variableColorKeys = getVariableColorKeys(colors)

const createScheme = (specificColors) => {
  const colorDefinitions = {
    ...colors,
    ...specificColors,
  }

  const accessCSSColor = colorDefinitions.cssColors
    ? (color) =>
        colorDefinitions.cssColors[color] || colorDefinitions[color] || color
    : (color) => colorDefinitions[color] || color

  const { mappings = {} } = colorDefinitions

  const getCSSColor = (color, mappingName = undefined) => {
    const mapping = mappings[mappingName] || {}
    return accessCSSColor(mapping[color] || color)
  }

  const createColorRule = (attr, color, mappingName = undefined) => {
    return css({
      [attr]: getCSSColor(color, mappingName),
    })
  }

  return {
    schemeKey: colorDefinitions.schemeKey,
    CSSVarSupport: colorDefinitions.CSSVarSupport,
    colorDefinitions,
    ranges: {
      neutral: colorDefinitions.neutral,
      sequential: [
        'sequential100',
        'sequential95',
        'sequential90',
        'sequential85',
        'sequential80',
        'sequential75',
        'sequential70',
        'sequential65',
        'sequential60',
        'sequential55',
        'sequential50',
      ].map((key) => colorDefinitions[key]),
      sequential3: ['sequential100', 'sequential80', 'sequential60'].map(
        (key) => colorDefinitions[key],
      ),
      opposite3: ['opposite100', 'opposite80', 'opposite60'].map(
        (key) => colorDefinitions[key],
      ),
      discrete: colorDefinitions.discrete,
    },
    set: memoize(createColorRule, (...args) => args.join('.')),
    getCSSColor,
  }
}

const ColorContext = React.createContext(createScheme(colors.light))

export const useColorContext = () => {
  const colorContext = useContext(ColorContext)
  return [colorContext]
}

const generateCSSColorDefinitions = (colors) => {
  return variableColorKeys
    .map((key) => `--color-${key}: ${colors[key]};`)
    .join(' ')
}

// ensure only main colors are available via context
const getObjectForKeys = (colorKeys, mapper = (key) => key) =>
  colorKeys.reduce((c, key) => {
    c[key] = mapper(key)
    return c
  }, {})

export const ColorContextLocalExtension: React.FC<{
  localColors: any
  localMappings: any
}> = ({ children, localColors = {}, localMappings = {} }) => {
  const [{ schemeKey, CSSVarSupport, colorDefinitions }] = useColorContext()

  const [colorValue, cssVarRule] = useMemo(() => {
    const { mappings = {} } = colorDefinitions

    const variableLocalColorKeys = getVariableColorKeys(localColors)

    const extendedColorDefinitions = {
      ...colorDefinitions,
      ...localColors[schemeKey === 'auto' ? 'light' : schemeKey],
      ...(CSSVarSupport
        ? getObjectForKeys(
            variableLocalColorKeys,
            (key) => `var(--color-${key})`,
          )
        : {}),
      mappings: {
        ...mappings,
        ...getObjectForKeys(Object.keys(localMappings), (key) => {
          return {
            ...mappings[key],
            ...localMappings[key],
          }
        }),
      },
      cssColors:
        schemeKey === 'auto'
          ? {
              ...colorDefinitions.cssColors,
              ...getObjectForKeys(variableLocalColorKeys, (key) => [
                localColors.light[key],
                `var(--color-${key})`,
              ]),
            }
          : undefined,
    }

    const lightColorCSSDefs = variableLocalColorKeys.reduce((defs, key) => {
      defs[`--color-${key}`] = localColors.light[key]
      return defs
    }, {})
    const darkColorCSSDefs = variableLocalColorKeys.reduce((defs, key) => {
      defs[`--color-${key}`] = localColors.dark[key]
      return defs
    }, {})

    return [
      createScheme(extendedColorDefinitions),
      css({
        // light auto
        ...lightColorCSSDefs,
        '[data-user-color-scheme="dark"] &': {
          // dark user
          ...darkColorCSSDefs,
        },
        '@media (prefers-color-scheme: dark)': {
          // dark auto
          ...darkColorCSSDefs,
          '[data-user-color-scheme="light"] &': {
            // light user
            ...lightColorCSSDefs,
          },
        },
      }),
    ]
  }, [colorDefinitions, localColors, localMappings, CSSVarSupport, schemeKey])

  return (
    <ColorContext.Provider value={colorValue}>
      <div {...cssVarRule}>{children}</div>
    </ColorContext.Provider>
  )
}

export const ColorHtmlBodyColors = ({ colorSchemeKey = 'auto' }) => {
  return (
    <style
      key={colorSchemeKey}
      dangerouslySetInnerHTML={{
        __html:
          colorSchemeKey === 'auto'
            ? [
                // default light
                `html, body { background-color: ${colors.light.default}; color: ${colors.light.text}; }`,
                // dark via user preference
                `html[data-user-color-scheme="dark"], html[data-user-color-scheme="dark"] body { background-color: ${colors.dark.default}; color: ${colors.dark.text}; }`,
                // os dark preference
                `@media (prefers-color-scheme: dark) {`,
                [
                  // auto dark via media query
                  `html, body { background-color: ${colors.dark.default}; color: ${colors.dark.text}; }`,
                  // light via user preference when os is dark
                  `html[data-user-color-scheme="light"], html[data-user-color-scheme="light"] body { background-color: ${colors.light.default}; color: ${colors.light.text}; }`,
                ].join('\n'),
                `}`,
              ].join('\n')
            : `html, body { background-color: ${colors[colorSchemeKey].default}; color: ${colors[colorSchemeKey].text}; }`,
      }}
    />
  )
}

export const ColorContextProvider: React.FC<{
  colorSchemeKey: 'light' | 'dark' | 'auto'
  root?: boolean
}> = ({ colorSchemeKey = 'auto', root = false, children }) => {
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
    } catch (e) {
      // continue regardless of error
    }
    if (!support) {
      // but if can't confirm the support in the browser we turn it off
      setCSSVarSupport(false)
    }
  }, [])

  const colorValue = useMemo(() => {
    if (colorSchemeKey === 'auto') {
      return createScheme({
        schemeKey: colorSchemeKey,
        CSSVarSupport,
        ...colors.light,
        ...(CSSVarSupport
          ? getObjectForKeys(variableColorKeys, (key) => `var(--color-${key})`)
          : {}),
        cssColors: getObjectForKeys(variableColorKeys, (key) => [
          colors.light[key],
          `var(--color-${key})`,
        ]),
      })
    }
    return createScheme({
      schemeKey: colorSchemeKey,
      ...colors[colorSchemeKey],
    })
  }, [colorSchemeKey, CSSVarSupport])

  return (
    <ColorContext.Provider value={colorValue}>
      {root && colorSchemeKey === 'auto' && (
        <style
          key={colorSchemeKey}
          dangerouslySetInnerHTML={{
            __html: [
              // default light
              `:root { ${generateCSSColorDefinitions(colors.light)} }`,
              // dark via user preference
              `:root[data-user-color-scheme="dark"] { ${generateCSSColorDefinitions(
                colors.dark,
              )} }`,
              // os dark preference
              `@media (prefers-color-scheme: dark) {`,
              [
                // auto dark via media query
                `:root { ${generateCSSColorDefinitions(colors.dark)} }`,
                // light via user preference when os is dark
                `:root[data-user-color-scheme="light"] { ${generateCSSColorDefinitions(
                  colors.light,
                )} }`,
              ].join('\n'),
              `}`,
            ].join('\n'),
          }}
        />
      )}
      {children}
    </ColorContext.Provider>
  )
}

export default ColorContext
