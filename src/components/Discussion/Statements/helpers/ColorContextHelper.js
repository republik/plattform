import React, { useMemo } from 'react'
import { getUniqueColorTagName } from './colorHelper'
import {
  ColorContextLocalExtension,
  ColorContextProvider
} from '../../../Colors/ColorContext'

const ColorContextHelper = ({ children, tagMappings = [] }) => {
  const localColors = useMemo(() => {
    const colorsObject = { light: {}, dark: {} }

    if (!tagMappings) return colorsObject

    tagMappings.forEach(({ tag, color }) => {
      const colorName = getUniqueColorTagName(tag)
      colorsObject.light[colorName] = color.light
      colorsObject.dark[colorName] = color.dark
    })

    return colorsObject
  }, [tagMappings])

  return (
    <ColorContextProvider>
      <ColorContextLocalExtension localColors={localColors}>
        {children}
      </ColorContextLocalExtension>
    </ColorContextProvider>
  )
}

export default ColorContextHelper
