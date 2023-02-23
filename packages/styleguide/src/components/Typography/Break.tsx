import React, { ReactNode } from 'react'

export const Break: React.FC<{
  children?: ReactNode
  attributes: any
  [x: string]: unknown
}> = ({ children, attributes, ...props }) => (
  <span {...attributes} {...props}>
    <br style={{ userSelect: 'none' }} contentEditable={false} />
    {children}
  </span>
)
