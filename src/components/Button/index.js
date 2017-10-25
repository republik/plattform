import React from 'react'
import {css, merge, simulate} from 'glamor'
import colors from '../../theme/colors'
import {fontFamilies} from '../../theme/fonts'

const buttonStyle = css({
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
  fontFamily: fontFamilies.sansSerifRegular,
  border: `1px solid ${colors.secondary}`,
  borderRadius: 0,
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
const blackStyle = css({
  backgroundColor: 'transparent',
  borderColor: '#000',
  color: '#000',
  ':hover': {
    backgroundColor: '#000',
    borderColor: '#000',
    color: '#fff'
  },
  ':active': {
    backgroundColor: '#000',
    borderColor: '#000',
    color: '#fff'
  }
})
const whiteStyle = css({
  backgroundColor: 'transparent',
  borderColor: '#fff',
  color: '#fff',
  ':hover': {
    backgroundColor: '#fff',
    borderColor: '#fff',
    color: '#000'
  },
  ':active': {
    backgroundColor: '#fff',
    borderColor: '#fff',
    color: '#000'
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

const Button = ({onClick, type, children, primary, black, white, big, block, style, disabled, simulate: sim}) => {
  const simulations = sim ? simulate(sim) : {}
  const styles = merge(
    buttonStyle,
    primary && primaryStyle,
    black && blackStyle,
    white && whiteStyle,
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
