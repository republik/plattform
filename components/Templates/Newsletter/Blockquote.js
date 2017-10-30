import React from 'react'

export default ({ children, attributes = {} }) => (
  <blockquote {...attributes}>
    {children}
  </blockquote>
)
