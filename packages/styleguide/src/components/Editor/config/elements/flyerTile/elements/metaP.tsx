import React from 'react'
import { ElementConfigI } from '../../../../custom-types'

export const FlyerMetaP = ({ children, attributes, ...props }) => (
  <p
    style={{
      color: '#0E755A',
      fontWeight: 700,
      fontFamily: 'GT America',
      fontSize: 30,
      paddingBottom: 90,
    }}
    {...attributes}
    {...props}
  >
    {children}
  </p>
)

export const config: ElementConfigI = {
  component: 'flyerMetaP',
  structure: [{ type: ['text', 'link', 'break'], repeat: true }],
}
