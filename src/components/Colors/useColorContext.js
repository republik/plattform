import { useContext, useMemo } from 'react'
import { css } from 'glamor'
import ColorContext from './ColorContext'
import colors from '../../theme/colors'

export const useColorContext = () => {
  const colorContext = useContext(ColorContext)
  return useMemo(() => {
    const colorScheme = {
      ...colors,
      ...colorContext
    }
    const { formatColorMap = {} } = colorScheme
    // precomputed css rules which are often used

    const createColorRule = (attr, color) => {
      return css({
        [attr]: colorScheme.cssColors?.[color] || colorScheme[color]
      })
    }

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
        backgroundColor: createColorRule('color', 'textSoft')
      },
      hover: {
        backgroundColor: createColorRule('backgroundColor', 'hover')
      },
      divider: {
        color: createColorRule('color', 'divider'),
        borderColor: createColorRule('borderColor', 'divider'),
        fill: createColorRule('fill', 'divider')
      },
      logo: {
        fill: createColorRule('fill', 'logo')
      }
    }

    return [
      {
        ...colorScheme,
        rules: colorRules,
        formatColorMapper: color => {
          if (formatColorMap[color]) {
            return formatColorMap[color]
          }
          return color
        }
      }
    ]
  }, [colorContext])
}
