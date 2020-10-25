import { useContext, useMemo } from 'react'
import ColorContext from './ColorContext'

export const useColorContext = () => {
  const colorContext = useContext(ColorContext)
  return [colorContext]
}
