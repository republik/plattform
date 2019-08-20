import React from 'react'
import colors from '../../theme/colors'

export const defaultValue = {
  bgColor: '#fff',
  color: '#000',
  outline: colors.outline
}

const CarouselContext = React.createContext(defaultValue)

export default CarouselContext
