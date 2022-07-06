import React from 'react'
import { ElementConfigI } from '../../../../custom-types'

export const FlyerTitle = ({ children, attributes, ...props }) => (
  <h2
    style={{
      fontFamily: 'Druk Text Wide Trial',
      fontStyle: 'Medium',
      fontSize: 40,
      paddingBottom: 40,
    }}
    {...attributes}
    {...props}
  >
    {children}
  </h2>
)

export const config: ElementConfigI = {
  component: 'flyerTitle',
}
