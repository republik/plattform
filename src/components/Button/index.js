import React from 'react'
import { css, merge, simulate } from 'glamor'
import colors from '../../theme/colors'
import { fontFamilies } from '../../theme/fonts'
import { pxToRem } from '../Typography/utils'

export const plainButtonRule = css({
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  outline: 'none',
  appearance: 'none',
  padding: 0
})

const buttonStyle = css(plainButtonRule, {
  display: 'inline-block',
  verticalAlign: 'middle',
  padding: '10px 20px 10px 20px',
  minWidth: 160,
  textAlign: 'center',
  textDecoration: 'none',
  fontSize: pxToRem(22),
  lineHeight: 1.5,
  height: pxToRem(60),
  boxSizing: 'border-box',
  backgroundColor: '#fff',
  fontFamily: fontFamilies.sansSerifRegular,
  border: `1px solid ${colors.secondary}`,
  borderRadius: 0,
  color: colors.secondary,
  '@media (hover)': {
    ':hover': {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      color: '#fff'
    }
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
  '@media (hover)': {
    ':hover': {
      backgroundColor: colors.secondary,
      borderColor: colors.secondary
    },
  },
  ':active': {
    backgroundColor: '#000',
    borderColor: '#000',
    color: '#fff'
  }
})
const dimmedStyle = css({
  backgroundColor: '#fff',
  color: colors.disabled,
  borderColor: colors.disabled
})
const blackStyle = css({
  backgroundColor: 'transparent',
  borderColor: '#000',
  color: '#000',
  '@media (hover)': {
    ':hover': {
      backgroundColor: '#000',
      borderColor: '#000',
      color: '#fff'
    },
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
  '@media (hover)': {
    ':hover': {
      backgroundColor: '#fff',
      borderColor: '#fff',
      color: '#000'
    },
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
  fontSize: pxToRem(22),
  height: pxToRem(80),
  padding: '10px 30px 10px 30px'
})

const Button = ({
  onClick, type, children, primary, dimmed, black, white,
  big, block, style, disabled, href, title, external, simulate: sim
}) => {
  const simulations = sim ? simulate(sim) : {}
  const styles = merge(
    buttonStyle,
    primary && primaryStyle,
    dimmed && dimmedStyle,
    black && blackStyle,
    white && whiteStyle,
    block && blockStyle,
    big && bigStyle
  )

  return (
    href ?
      (<a href={href} title={title} target={external ? '_blank' : ''} {...styles}>{children}</a>) :
      (<button onClick={onClick} type={type} style={style} disabled={disabled}
               {...styles}
               {...simulations}>
        {children}
      </button>)
  )
}

export default Button
