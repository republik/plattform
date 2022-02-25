import React from 'react'

const Rewind = ({ size, fill, disabled }) => (
  <svg width={size} height={size} viewBox='0 0 24 24'>
    <path
      d='M6 6h2v12H6zm3.5 6l8.5 6V6z'
      fill={fill}
      opacity={disabled ? 0.5 : 1}
    />
  </svg>
)

Rewind.defaultProps = {
  size: 24,
  fill: '#fff',
  disabled: true,
}

export default Rewind
