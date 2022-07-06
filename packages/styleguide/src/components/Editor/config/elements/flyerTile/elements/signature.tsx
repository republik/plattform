import React from 'react'
import { ElementConfigI } from '../../../../custom-types'

export const FlyerSignature = ({ children, attributes, ...props }) => (
  <p
    style={{
      fontWeight: 400,
      fontFamily: 'GT America',
      fontSize: 26,
      textAlign: 'center',
    }}
    {...attributes}
    {...props}
  >
    {children}
  </p>
)

export const config: ElementConfigI = {
  component: 'flyerSignature',
}
