import React from 'react'

export const defaultValue = {
  bgColor: '#fff',
  color: '#000'
}

const CarouselContext = React.createContext(defaultValue)

export default CarouselContext
