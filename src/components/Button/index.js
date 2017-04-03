import React from 'react'
import {css, merge, simulate} from 'glamor'
import * as colors from '../../theme/colors'

const fieldStyle = css({
  outline: 'none',
  verticalAlign: 'bottom',
  padding: '10px 20px 10px 20px',
  minWidth: 160,
  textAlign: 'center',
  textDecoration: 'none',
  fontSize: 22,
  height: 60,
  boxSizing: 'border-box',
  backgroundColor: '#fff',
  border: `1px solid ${colors.secondary}`,
  color: colors.secondary,
  cursor: 'pointer',
  ':hover': {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    color: '#fff'
  },
  ':active': {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
    color: '#fff'
  },
  ':disabled, [disabled]': {
    backgroundColor: '#fff',
    color: colors.disabled,
    borderColor: colors.disabled,
    cursor: 'default'
  }
})
const primaryStyle = css({
  backgroundColor: colors.primary,
  borderColor: colors.primary,
  color: '#fff',
  ':hover': {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary
  },
  ':active': {
    backgroundColor: '#000',
    borderColor: '#000',
    color: '#fff'
  }
})
const blockStyle = css({
  display: 'block',
  width: '100%'
})
const bigStyle = css({
  fontSize: 22,
  height: 80,
  padding: '10px 30px 10px 30px'
})

const Button = ({onClick, type, children, primary, big, block, style, disabled, simulate: sim}) => {
  const simulations = sim ? simulate(sim) : {}
  const styles = merge(
    fieldStyle,
    primary && primaryStyle,
    block && blockStyle,
    big && bigStyle
  )

  return (
    <button onClick={onClick} type={type} style={style} disabled={disabled}
      {...styles}
      {...simulations}>
      {children}
    </button>
  )
}

export default Button
