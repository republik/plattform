import { css } from 'glamor'
import memoize from 'lodash/memoize'
import React, { ReactNode, useContext, useMemo } from 'react'

import colors from '../../theme/colors'

const VALID_COLOR_VARIABLE_REGEX = /^[a-z][a-zA-Z0-9]+$/

const createScheme = ({ mappings = {} }) => {
  const getCSSColor = (color: string, mappingName: string = undefined) => {
    // For backwards compatibility, we map some colors to variable names.
    // E.g. when mappingName is 'format', '#000' is looked up in mappings.format['#000'] and becomes 'accentColorMeta'
    const mappedColor = mappings[mappingName]?.[color] ?? color

    return VALID_COLOR_VARIABLE_REGEX.test(mappedColor)
      ? `var(--color-${color})`
      : color
  }

  const createColorRule = (attr, color, mappingName = undefined) => {
    return css({
      [attr]: getCSSColor(color, mappingName),
    })
  }

  return {
    mappings,
    ranges: {
      neutral: getCSSColor('neutral'),
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
      ].map((key) => getCSSColor(key)),
      sequential3: ['sequential100', 'sequential80', 'sequential60'].map(
        (key) => getCSSColor(key),
      ),
      opposite3: ['opposite100', 'opposite80', 'opposite60'].map((key) =>
        getCSSColor(key),
      ),
      discrete: getCSSColor('discrete'),
    },
    set: memoize(createColorRule, (...args) => args.join('.')),
    getCSSColor,
  }
}
const generateCSSColorDefinitions = (colors) => {
  return Object.entries(colors)
    .map(([key, value]) => `--color-${key}: ${value};`)
    .join('\n')
}

// ensure only main colors are available via context
const getObjectForKeys = (colorKeys, mapper = (key) => key) =>
  colorKeys.reduce((c, key) => {
    c[key] = mapper(key)
    return c
  }, {})

const defaultColorContextValue = createScheme({
  // colorVariables: variableColorKeys,
})

const ColorContext = React.createContext(defaultColorContextValue)

export const useColorContext = () => {
  const colorContext = useContext(ColorContext)
  return [colorContext]
}

export const ColorContextLocalExtension: React.FC<{
  children?: ReactNode
  localColors: any
  localMappings: any
}> = ({ children, localColors = colors, localMappings = {} }) => {
  const [{ mappings }] = useColorContext()

  const colorValue = useMemo(() => {
    return createScheme({
      mappings: {
        ...mappings,
        ...getObjectForKeys(Object.keys(localMappings), (key) => {
          return {
            ...mappings[key],
            ...localMappings[key],
          }
        }),
      },
    })
  }, [mappings, localMappings])

  const cssVarRule = useMemo(() => {
    const lightColorCSSDefs = Object.entries(localColors.light).reduce(
      (defs, [key, value]) => {
        defs[`--color-${key}`] = value
        return defs
      },
      {},
    )
    const darkColorCSSDefs = Object.entries(localColors.dark).reduce(
      (defs, [key, value]) => {
        defs[`--color-${key}`] = value
        return defs
      },
      {},
    )

    return css({
      ':root &, .light &': lightColorCSSDefs,
      '.dark &': darkColorCSSDefs,
    })
  }, [localColors])

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
          `:root, .light, .dark .inverted { ${generateCSSColorDefinitions(
            'var(--color-light)',
          )} }`,
          // dark class applied to html element via next-themes OR manually applied on an element
          `.dark, .light .inverted { ${generateCSSColorDefinitions(
            'var(--color-dark)',
          )} }`,
        ].join('\n'),
      }}
    />
  )
}

const colorSchemeKeyToClassName = (colorSchemeKey: string) => {
  return colorSchemeKey === 'light' || colorSchemeKey === 'dark'
    ? colorSchemeKey
    : ''
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
      <div className={colorSchemeKeyToClassName(colorSchemeKey)}>
        {children}
      </div>
    </ColorContext.Provider>
  )
}

export const InvertedColorScheme = ({ children }: { children: ReactNode }) => {
  return <div className='inverted'>{children}</div>
}

export default ColorContext
