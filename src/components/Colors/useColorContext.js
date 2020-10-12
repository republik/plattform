import { useContext, useMemo } from 'react'
import { css } from 'glamor'
import ColorContext from './ColorContext'
import colors from '../../theme/colors'
import memoize from 'lodash/memoize'

export const useColorContext = () => {
  const colorContext = useContext(ColorContext)
  return useMemo(() => {
    const colorScheme = {
      ...colors,
      ...colorContext
    }
    const { formatColorMap = {} } = colorScheme

    const getCSSColor = color =>
      colorScheme.cssColors?.[color] || colorScheme[color] || color

    const createColorRule = (attr, color, pseudo) => {
      const cssColor = getCSSColor(color)
      return css(
        pseudo
          ? pseudo === ':hover'
            ? {
                '@media (hover)': {
                  ':hover': {
                    [attr]: cssColor
                  }
                }
              }
            : {
                [pseudo]: {
                  [attr]: cssColor
                }
              }
          : {
              [attr]: cssColor
            }
      )
    }

    // precomputed css rules which are often used
    const colorRules = {
      text: {
        color: createColorRule('color', 'text'),
        borderColor: createColorRule('borderColor', 'text'),
        fill: createColorRule('fill', 'text')
      },
      textSoft: {
        color: createColorRule('color', 'textSoft')
      },
      default: {
        backgroundColor: createColorRule('backgroundColor', 'default'),
        borderColor: createColorRule('borderColor', 'default')
      },
      overlay: {
        backgroundColor: createColorRule('backgroundColor', 'overlay'),
        boxShadow: createColorRule('boxShadow', 'overlayShadow')
      },
      hover: {
        backgroundColor: createColorRule('backgroundColor', 'hover')
      },
      divider: {
        color: createColorRule('color', 'divider'),
        borderColor: createColorRule('borderColor', 'divider'),
        fill: createColorRule('fill', 'divider'),
        backgroundColor: createColorRule('backgroundColor', 'divider')
      },
      logo: {
        fill: createColorRule('fill', 'logo')
      }
    }

    return [
      {
        ...colorScheme,
        rules: colorRules,
        getColorRule: memoize(createColorRule, (...args) => args.join('.')),
        getCSSColor,
        getFormatCSSColor: color => {
          if (formatColorMap[color]) {
            return getCSSColor(formatColorMap[color])
          }
          return color
        }
      }
    ]
  }, [colorContext])
}
