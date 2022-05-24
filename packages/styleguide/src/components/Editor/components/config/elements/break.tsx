import React from 'react'
import { ElementConfigI } from '../../../custom-types'

export const Break: React.FC<{
  attributes: any
  [x: string]: unknown
}> = ({ children, attributes, ...props }) => (
  <span {...attributes} {...props}>
    <br style={{ userSelect: 'none' }} contentEditable={false} />
    {children}
  </span>
)

export const config: ElementConfigI = {
  component: 'break',
  attrs: {
    isInline: true,
    isVoid: true,
  },
}
