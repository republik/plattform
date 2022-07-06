import React from 'react'
import { ElementConfigI } from '../../../../custom-types'

export const FlyerTitle = ({ children, attributes, ...props }) => (
  <h2
    {...attributes}
    {...props}
    style={{
      fontFamily: 'Druk Text Wide Trial',
      fontStyle: 'Medium',
      fontSize: 40,
      paddingBottom: 40,
    }}
  >
    {children}
  </h2>
)

export const config: ElementConfigI = {
  component: 'flyerTitle',
  attrs: {
    isMain: true,
  },
}
