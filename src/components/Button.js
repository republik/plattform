import React from 'react'
import {css} from 'glamor'

const fieldStyle = css({
  verticalAlign: 'bottom',
  color: '#444',
  padding: '10px 20px 10px 20px',
  border: 'solid #444 1px',
  textDecoration: 'none',
  backgroundColor: 'white',
  fontSize: 14,
  height: 37,
  boxSizing: 'border-box'
})
const buttonStyle = css({
  ':hover': {
    background: '#444',
    color: 'white'
  }
})

const Button = ({onClick, type, children}) => (
  <button onClick={onClick} type={type}
    {...fieldStyle}
    {...buttonStyle}>
    {children}
  </button>
)

export default Button
