import React from 'react'
import colors from '../../../theme/colors'

const Icon = ({ size = '1em', fill = colors.text, ...props }) => (
  <svg width={size} height={size} viewBox='0 0 24 24' {...props}>
    <path d='M11.67 3.87L9.9 2.1 0 12l9.9 9.9 1.77-1.77L3.54 12z' fill={fill} />
    <path fill='none' d='M0 0h24v24H0z' />
  </svg>
)

export default Icon
