import React from 'react'

const ratio = 1.385

type PlayProps = {
  width?: number
  fill?: string
}

const Play = ({ width = 26, fill = '#ffffff' }: PlayProps) => (
  <svg width={width} height={width * ratio} viewBox='0 0 26 36'>
    <path d='M25.956 18.188L.894 35.718V.66' fill={fill} />
  </svg>
)

export default Play
