import React, { useContext, useState, useEffect } from 'react'
import ColorContext from './ColorContext'
import colors from '../../theme/colors'

export const useColorContext = () => {
  const colorContext = useContext(ColorContext)
  const [colorScheme, setColorScheme] = useState({})

  useEffect(() => {
    setColorScheme({
      ...colors,
      ...colorContext
    })
  }, [colorContext])

  return [colorScheme]
}
