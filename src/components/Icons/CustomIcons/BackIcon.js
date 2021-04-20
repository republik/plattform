import React from 'react'
import CustomIconBase from './CustomIconBase'

export const BackIcon = ({ fill, ...props }) => (
  <CustomIconBase {...props}>
    <path d='M11.67 3.87L9.9 2.1 0 12l9.9 9.9 1.77-1.77L3.54 12z' fill={fill} />
  </CustomIconBase>
)
