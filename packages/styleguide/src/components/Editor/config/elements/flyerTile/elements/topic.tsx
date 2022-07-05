import React from 'react'
import { ElementConfigI } from '../../../../custom-types'

export const FlyerTopic = ({ children, attributes, ...props }) => (
  <p
    style={{ color: 'red', textTransform: 'uppercase' }}
    {...attributes}
    {...props}
  >
    {children}
  </p>
)

export const config: ElementConfigI = {
  component: 'flyerTopic',
}
