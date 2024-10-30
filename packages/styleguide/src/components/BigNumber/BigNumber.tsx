import React from 'react'

const BigNumber = ({
  children,
  attributes,
  color,
}) => {
  return (
    <div
      style={{ color: color }}
      {...attributes}
    >
      {children}
    </div>
  )
}

export default BigNumber
