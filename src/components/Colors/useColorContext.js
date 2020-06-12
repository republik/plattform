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
    // precomputed css rules which are often used
    const colorRules = {
      textColor: css({
        color: colorScheme.text
      })
    }
    return [
      {
        ...colorScheme,
        rules: colorRules
      }
    ]
  }, [colorContext])
}
