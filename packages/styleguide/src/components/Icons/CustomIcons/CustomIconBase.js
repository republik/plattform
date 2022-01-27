import React from 'react'
import { useIconContext } from '../IconContext'

export default ({
  size = '1em',
  viewBox = '0 0 24 24',
  children,
  ...props
}) => {
  const iconContext = useIconContext()
  return (
    <svg
      width={iconContext.size || size}
      height={iconContext.size || size}
      viewBox={viewBox}
      {...iconContext}
      {...props}
    >
      {children}
    </svg>
  )
}
