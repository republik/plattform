import React from 'react'

export default ({ children, attributes = {} }) => (
  <p {...attributes}>{children}</p>
)
