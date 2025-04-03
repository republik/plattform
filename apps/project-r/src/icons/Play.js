import React from 'react'

const ratio = 1.385
/**
 * @typedef PlayProps
 * @property {number | string} width
 * @property {string} fill
 */

/**
 * Play component
 * @param {PlayProps} props
 * @returns {JSX.Element}
 */
const Play = ({ width = 26, fill = '#fff' }) => (
  <svg width={width} height={width * ratio} viewBox='0 0 26 36'>
    <path d='M25.956 18.188L.894 35.718V.66' fill={fill} />
  </svg>
)

export default Play
