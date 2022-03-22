import React from 'react'
import { ElementConfigI } from '../../custom-types'

const Component: React.FC<{
  [x: string]: unknown
}> = ({ children, ...props }) => (
  <span {...props}>
    <br style={{ userSelect: 'none' }} contentEditable={false} />
    {children}
  </span>
)

export const config: ElementConfigI = {
  Component,
  attrs: {
    isInline: true,
    isVoid: true,
  },
}
