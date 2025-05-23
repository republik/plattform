import { css } from 'glamor'
import memoize from 'lodash/memoize'
import React, { ReactNode, useContext, useMemo } from 'react'

import colors from '../../theme/colors'

const getVariableColorKeys = (colors) => {
  return Array.from(
    new Set([...Object.keys(colors.light), ...Object.keys(colors.dark)]),
  )
}

// identify all variable color keys
const variableColorKeys = getVariableColorKeys(colors)

const createScheme = (specificColors) => {
  const colorDefinitions = {
    ...colors,
    ...specificColors,
  }

  const { mappings = {} } = colorDefinitions

  const getCSSColor = (color, mappingName = undefined) => {
    // For backwards compatibility, we map some colors to variable names.
    // E.g. when mappingName is 'format', '#000' is looked up in mappings.format['#000'] and becomes 'accentColorMeta'
    const mapping = mappings[mappingName] || {}

    return color in mapping
      ? `var(--color-${mapping[color]})`
      : color in colorDefinitions
      ? `var(--color-${color})`
      : color
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
      neutral: [colorDefinitions.neutral],
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
      discrete: [
        'discrete1',
        'discrete2',
        'discrete3',
        'discrete4',
        'discrete5',
        'discrete6',
        'discrete7',
        'discrete8',
        'discrete9',
        'discrete10',
      ].map((key) => colorDefinitions[key]),
    },
    set: memoize(createColorRule, (...args) => args.join('.')),
    getCSSColor,
  }
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

const defaultColorContextValue = createScheme({
  schemeKey: 'auto',
  ...getObjectForKeys(variableColorKeys, (key) => `var(--color-${key})`),
})

const ColorContext = React.createContext(defaultColorContextValue)

export const useColorContext = () => {
  const colorContext = useContext(ColorContext)
  return [colorContext]
}

export const ColorContextLocalExtension: React.FC<{
  children?: ReactNode
  localColors?: any
  localMappings?: any
}> = ({ children, localColors = colors, localMappings = {} }) => {
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
        ':root &, [data-theme="light"] &': {
          ...lightColorCSSDefs,
        },
        ':root[data-theme="dark"] &, [data-theme="dark"] &': {
          ...darkColorCSSDefs,
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
      data-testid='theme-variables'
      dangerouslySetInnerHTML={{
        __html: [
          // default light
          `:root, [data-theme="light"], [data-theme="dark"] [data-theme-inverted] { ${generateCSSColorDefinitions(
            colors.light,
          )} }`,
          // dark class applied to html element via next-themes OR manually applied on an element
          `[data-theme="dark"], [data-theme="light"] [data-theme-inverted] { ${generateCSSColorDefinitions(
            colors.dark,
          )} }`,
          `@media print {
            [data-theme="dark"], [data-theme="light"] [data-theme-inverted] { ${generateCSSColorDefinitions(
              colors.light,
            )} }
          }`,
        ].join('\n'),
      }}
    />
  )
}

const colorSchemeKeyToDataTheme = (colorSchemeKey: string) => {
  return colorSchemeKey === 'light' || colorSchemeKey === 'dark'
    ? colorSchemeKey
    : undefined
}

export const ColorContextProvider: React.FC<{
  children?: ReactNode
  colorSchemeKey: 'light' | 'dark' | 'auto'
  root?: boolean
}> = ({ colorSchemeKey = 'auto', root = false, children }) => {
  if (root) {
    throw Error(`root prop not supported anymore on ColorContextProvider`)
  }

  return (
    <ColorContext.Provider value={defaultColorContextValue}>
      <div data-theme={colorSchemeKeyToDataTheme(colorSchemeKey)}>
        {children}
      </div>
    </ColorContext.Provider>
  )
}

export const InvertedColorScheme = ({ children }: { children: ReactNode }) => {
  return <div data-theme-inverted>{children}</div>
}

export default ColorContext
