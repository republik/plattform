import React from 'react'
import { ElementConfigI } from '../../../../custom-types'

export const FlyerTopic = ({ children, attributes, ...props }) => (
  <p
    {...attributes}
    {...props}
    style={{
      color: '#D50032',
      fontFamily: 'Druk Text Wide Trial',
      fontStyle: 'Medium',
      fontSize: 20,
      textTransform: 'uppercase',
    }}
  >
    {children}
  </p>
)

export const config: ElementConfigI = {
  component: 'flyerTopic',
}
