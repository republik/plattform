import React from 'react'
import { ElementConfigI } from '../../../../custom-types'

export const FlyerTitle = ({ children, attributes, ...props }) => (
  <p style={{ fontSize: 36 }} {...attributes} {...props}>
    {children}
  </p>
)

export const config: ElementConfigI = {
  component: 'flyerTitle',
}
