import React, { useContext } from 'react'
import ColorContext from './ColorContext'
import colors from '../../theme/colors'

export const useColorContext = () => {
  const colorScheme = useContext(ColorContext)
  return [
    {
      ...colors,
      ...colorScheme
    }
  ]
}
