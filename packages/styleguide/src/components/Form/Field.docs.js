import React from 'react'

export const RefComponent = ({ children, ...props }) => {
  const ref = React.useRef()

  return children(ref)
}
