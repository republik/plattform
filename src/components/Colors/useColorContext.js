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
    const colorRules = {
      textColor: css({
        color: colorScheme.cssColors?.text || colorScheme.text
      }),
      textBorderColor: css({
        borderColor: colorScheme.cssColors?.text || colorScheme.text
      }),
      textFill: css({
        fill: colorScheme.cssColors?.text || colorScheme.text
      }),
      logoFill: css({
        fill: colorScheme.cssColors?.logo || colorScheme.logo
      }),
      lightTextColor: css({
        color: colorScheme.cssColors?.lightText || colorScheme.lightText
      }),
      defaultBackgroundColor: css({
        backgroundColor: colorScheme.cssColors?.default || colorScheme.default
      }),
      hoverBackgroundColor: css({
        backgroundColor: colorScheme.cssColors?.hover || colorScheme.hover
      }),
      dividerColor: css({
        color: colorScheme.cssColors?.divider || colorScheme.divider
      }),
      dividerBorderColor: css({
        borderColor: colorScheme.cssColors?.divider || colorScheme.divider
      }),
      dividerBackgroundColor: css({
        backgroundColor: colorScheme.cssColors?.divider || colorScheme.divider
      })
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
