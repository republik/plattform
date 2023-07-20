import { css } from 'glamor'
import memoize from 'lodash/memoize'
import React, { ReactNode, useContext, useMemo } from 'react'

import colors, { localInvertedColors } from '../../theme/colors'

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

  const accessCSSColor = (color) => colorDefinitions[color] || color

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
  children?: ReactNode
  localColors: any
  localMappings: any
}> = ({ children, localColors = localInvertedColors, localMappings = {} }) => {
  const [{ schemeKey, colorDefinitions }] = useColorContext()

  const [colorValue, cssVarRule] = useMemo(() => {
    const { mappings = {} } = colorDefinitions

    const variableLocalColorKeys = getVariableColorKeys(localColors)

    const extendedColorDefinitions = {
      ...colorDefinitions,
      ...localColors[schemeKey === 'auto' ? 'light' : schemeKey],
      ...getObjectForKeys(
        variableLocalColorKeys,
        (key) => `var(--color-${key})`,
      ),
      mappings: {
        ...mappings,
        ...getObjectForKeys(Object.keys(localMappings), (key) => {
          return {
            ...mappings[key],
            ...localMappings[key],
          }
        }),
      },
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
  }, [colorDefinitions, localColors, localMappings, schemeKey])

  return (
    <ColorContext.Provider value={colorValue}>
      <div {...cssVarRule}>{children}</div>
    </ColorContext.Provider>
  )
}

export const RootColorVariables = () => {
  return (
    <style
      id='theme-variables'
      dangerouslySetInnerHTML={{
        __html: [
          // default light
          `:root { ${generateCSSColorDefinitions(colors.light)} }`,
          // dark class applied to html element via next-themes OR manually applied on an element
          `.dark { ${generateCSSColorDefinitions(colors.dark)} }`,
        ].join('\n'),
      }}
    />
  )
}

export const ColorContextProvider: React.FC<{
  children?: ReactNode
  colorSchemeKey: 'light' | 'dark' | 'auto'
  root?: boolean
}> = ({ colorSchemeKey = 'auto', root = false, children }) => {
  if (root) {
    throw Error(`root prop not supported anymore on ColorContextProvider`)
  }

  const colorValue = useMemo(() => {
    if (colorSchemeKey === 'auto') {
      return createScheme({
        schemeKey: colorSchemeKey,
        ...colors.light,
        ...getObjectForKeys(variableColorKeys, (key) => `var(--color-${key})`),
      })
    }
    return createScheme({
      schemeKey: colorSchemeKey,
      ...colors[colorSchemeKey],
    })
  }, [colorSchemeKey])

  return (
    <ColorContext.Provider value={colorValue}>{children}</ColorContext.Provider>
  )
}

export default ColorContext
