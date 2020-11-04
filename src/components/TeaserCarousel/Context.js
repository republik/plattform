import React from 'react'

export const defaultValue = {
  bgColor: '#fff',
  color: '#282828'
}

const CarouselContext = React.createContext(defaultValue)

export default CarouselContext
