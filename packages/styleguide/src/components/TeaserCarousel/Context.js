import React from 'react'

export const defaultValue = {
  bgColor: 'default',
  color: 'text',
}

const CarouselContext = React.createContext(defaultValue)

export default CarouselContext
