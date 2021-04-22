import React from 'react'
import CustomIconBase from './CustomIconBase'

export const CheckSmallIcon = ({ fill, ...props }) => (
  <CustomIconBase {...props}>
    <path d='M16.59 7.58L10 14.17l-3.59-3.58L5 12l5 5 8-8z' fill={fill} />
  </CustomIconBase>
)
