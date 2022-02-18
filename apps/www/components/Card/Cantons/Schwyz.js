import React from 'react'

const SvgSchwyz = (props) => (
  <svg
    width={props.size}
    height={(props.size * 474.797) / 473.19}
    viewBox='-207.698 -207.938 473.19 474.797'
    {...props}
  >
    <path fill='#e8423f' d='M-207.698-207.938h473.19v474.797h-473.19z' />
    <path
      fill='#fff'
      d='M-182.21-112.856v23.192h70.711v70.726h23.176v-70.726h70.711v-23.192h-70.711v-70.714h-23.176v70.714z'
    />
  </svg>
)

export default SvgSchwyz
