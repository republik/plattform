import React from 'react'
import colors from '../../theme/colors'

const defaultColors = colors
const ColorContext = React.createContext(defaultColors)

export const GlobalColorContextProvider = ({ forcedValue, children }) => {
  return (
    <ColorContext.Provider value={forcedValue}>
      {children}
    </ColorContext.Provider>
  )

  const colors = {
    primary: '#00508C',
    primaryBg: '#BFE1FF',
    containerBg: '#FFF',
    secondary: '#00335A',
    secondaryBg: '#D8EEFF',
    disabled: '#B8BDC1',
    text: '#191919',
    lightText: '#979797'
  }
  const varColors = {
    primary: 'var(--color-primary)',
    text: 'var(--color-text)',
    rawColor: colors
  }
  css.global(':root', {
    '--color-primary': colors.primary,
    '--color-text': colors.text,
    '@media (prefers-color-scheme: dark)': {
      '--color-primary': colors.negative.primary,
      '--color-text': colors.negative.text
    }
  })

  return (
    <ColorContext.Provider value={varColors}>{children}</ColorContext.Provider>
  )
}

export default ColorContext
