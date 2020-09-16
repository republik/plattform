import React, { useEffect, useState } from 'react'
import colors, { mainColorKeys } from '../../theme/colors'

const defaultColors = colors
const ColorContext = React.createContext(defaultColors)

export const generateCSSColorDefinitions = colors => {
  return mainColorKeys.map(key => `--color-${key}: ${colors[key]};`).join(' ')
}

// ensure only main colors are available via context
const reduceMainColors = (mapper = key => key) =>
  mainColorKeys.reduce((c, key) => {
    c[key] = mapper(key)
    return c
  }, {})

export const ColorContextProvider = ({ value: forcedValue, children }) => {
  // we initially assume browser support it
  // - e.g. during server side rendering
  const [CSSSupport, setCSSSupport] = useState(true)
  useEffect(() => {
    let support
    try {
      support =
        window.CSS &&
        window.CSS.supports &&
        window.CSS.supports('color', 'var(--primary)')
    } catch (e) {}
    if (!support) {
      // but if can't confirm the support in the browser we turn it off
      setCSSSupport(false)
    }
  }, [])

  let colorValue
  if (forcedValue) {
    colorValue = reduceMainColors(key => forcedValue[key])
  } else if (CSSSupport) {
    colorValue = reduceMainColors(key => `var(--color-${key})`)
    colorValue.rawColors = colors
  } else {
    colorValue = reduceMainColors(key => colors[key])
  }

  return (
    <ColorContext.Provider value={colorValue}>{children}</ColorContext.Provider>
  )
}

export default ColorContext
