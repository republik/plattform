import React from 'react'
import { ElementConfigI } from '../../../../custom-types'

export const FlyerMetaP = ({ children, attributes, ...props }) => (
  <p style={{ color: 'green', fontWeight: 'bold' }} {...attributes} {...props}>
    {children}
  </p>
)

export const config: ElementConfigI = {
  component: 'flyerMetaP',
  structure: [{ type: ['text', 'link', 'break'], repeat: true }],
}
