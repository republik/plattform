import React from 'react'
import {css, merge, simulate} from 'glamor'

const fieldStyle = css({
  verticalAlign: 'bottom',
  padding: '10px 20px 10px 20px',
  textDecoration: 'none',
  fontSize: 14,
  height: 40,
  boxSizing: 'border-box',
  backgroundColor: 'rgb(9,81,138)',
  border: 'solid rgb(9,81,138) 1px',
  color: '#fff',
  ':hover': {
    backgroundColor: '#fff',
    color: 'rgb(9,81,138)'
  }
})
const primaryStyle = css({
  fontSize: 18,
  height: 50,
  color: '#fff',
  ':hover': {
    backgroundColor: '#fff',
    color: 'rgb(9,81,138)'
  }
})

const Button = ({onClick, type, children, primary, simulate: sim}) => {
  const simulations = sim ? simulate(sim) : {}
  const style = primary
    ? merge(fieldStyle, primaryStyle)
    : fieldStyle
  return (
    <button onClick={onClick} type={type}
      {...style}
      {...simulations}>
      {children}
    </button>
  )
}

export default Button
