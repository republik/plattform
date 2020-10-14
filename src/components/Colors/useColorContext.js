import { useContext, useMemo } from 'react'
import ColorContext from './ColorContext'

export const useColorContext = () => {
  const colorContext = useContext(ColorContext)
  return useMemo(() => {
    // precomputed css rules which are often used
    const colorRules = {
      text: {
        color: colorContext.set('color', 'text'),
        borderColor: colorContext.set('borderColor', 'text'),
        fill: colorContext.set('fill', 'text')
      },
      textSoft: {
        color: colorContext.set('color', 'textSoft')
      },
      default: {
        backgroundColor: colorContext.set('backgroundColor', 'default'),
        borderColor: colorContext.set('borderColor', 'default')
      },
      overlay: {
        backgroundColor: colorContext.set('backgroundColor', 'overlay'),
        boxShadow: colorContext.set('boxShadow', 'overlayShadow')
      },
      hover: {
        backgroundColor: colorContext.set('backgroundColor', 'hover')
      },
      divider: {
        color: colorContext.set('color', 'divider'),
        borderColor: colorContext.set('borderColor', 'divider'),
        fill: colorContext.set('fill', 'divider'),
        backgroundColor: colorContext.set('backgroundColor', 'divider')
      },
      logo: {
        fill: colorContext.set('fill', 'logo')
      },
      disabled: {
        color: colorContext.set('color', 'disabled'),
        borderColor: colorContext.set('borderColor', 'disabled'),
        fill: colorContext.set('fill', 'disabled')
      }
    }

    return [
      {
        ...colorContext,
        rules: colorRules,
        getColorRule: colorContext.set
      }
    ]
  }, [colorContext])
}
