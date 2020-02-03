import { useContext } from 'react'
import ColorContext from './ColorContext'
import colors from '../../theme/colors'

export const useColorContext = () => {
  const colorContext = useContext(ColorContext)
  return [
    {
      ...colors,
      ...colorContext
    }
  ]
}
