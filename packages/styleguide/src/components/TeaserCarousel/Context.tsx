import React from 'react'

type CarouselContext = Partial<{
  bigger
  outline
  bgColor
  color
  tileCount
  tileMaxWidth
  grid
}>

export const defaultValue = {
  bgColor: 'default',
  color: 'text',
}

const CarouselContext = React.createContext<CarouselContext>(defaultValue)

export default CarouselContext
