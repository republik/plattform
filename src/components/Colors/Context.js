import React from 'react'

export const defaultValue = {
  bgColor: '#fff',
  color: '#000'
}

const ColorContext = React.createContext(defaultValue)

export default ColorContext
