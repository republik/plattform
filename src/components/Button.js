import React from 'react'
import {css, merge, simulate} from 'glamor'
import * as colors from '../theme/colors'

const fieldStyle = css({
  verticalAlign: 'bottom',
  padding: '10px 20px 10px 20px',
  textDecoration: 'none',
  fontSize: 14,
  height: 40,
  boxSizing: 'border-box',
  backgroundColor: colors.primary,
  border: 'none',
  color: '#fff',
  ':hover': {
    backgroundColor: colors.primaryHover
  }
})
const primaryStyle = css({
  fontSize: 18,
  height: 50
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
