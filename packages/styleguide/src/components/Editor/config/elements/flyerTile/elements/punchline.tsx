import React from 'react'
import { ElementConfigI } from '../../../../custom-types'

export const FlyerPunchline = ({ children, attributes, ...props }) => (
  <p {...attributes} {...props}>
    <small>{children}</small>
  </p>
)

export const config: ElementConfigI = {
  component: 'flyerPunchline',
  structure: [{ type: ['text', 'link', 'break'], repeat: true }],
}
