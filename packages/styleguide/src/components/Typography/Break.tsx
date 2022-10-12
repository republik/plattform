import React from 'react'

export const Break: React.FC<{
  attributes: any
  [x: string]: unknown
}> = ({ children, attributes, ...props }) => (
  <span {...attributes} {...props}>
    <br style={{ userSelect: 'none' }} contentEditable={false} />
    {children}
  </span>
)
