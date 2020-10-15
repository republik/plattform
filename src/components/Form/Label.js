import React from 'react'
import { css, merge } from 'glamor'

import colors from '../../theme/colors'
import { sansSerifRegular22 } from '../Typography/styles'
import { convertStyleToRem, pxToRem } from '../Typography/utils'
import {
  Y_PADDING,
  BORDER_WIDTH,
  LABEL_HEIGHT,
  FIELD_HEIGHT
} from './constants'

const styles = {
  label: css({
    width: '100%',
    paddingTop: pxToRem(LABEL_HEIGHT),
    position: 'relative',
    display: 'block'
  }),
  labelText: css({
    ...convertStyleToRem(sansSerifRegular22),
    lineHeight: pxToRem(20),
    color: colors.disabled,
    position: 'absolute',
    top: pxToRem(LABEL_HEIGHT + Y_PADDING),
    transition: 'top 200ms, font-size 200ms'
  }),
  labelTextTop: css({
    top: 5,
    fontSize: pxToRem(14),
    lineHeight: pxToRem(15)
  }),
  labelTextFocused: css({
    color: colors.primary
  }),
  labelTextError: css({
    color: colors.error
  }),
  field: css({
    display: 'block',
    padding: '7px 0 5px',
    ...convertStyleToRem(sansSerifRegular22),
    lineHeight: pxToRem(27),
    minHeight: pxToRem(FIELD_HEIGHT),
    color: colors.text,
    width: '100%',
    appearance: 'none',
    outline: 'none',
    borderRadius: 0,
    backgroundColor: '#fff',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    borderBottom: `solid ${colors.disabled} ${BORDER_WIDTH}px`,
    ':focus': {
      borderColor: colors.primary
    }
  }),
  select: css({
    position: 'absolute',
    top: pxToRem(LABEL_HEIGHT),
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    ':focus + svg': {
      fill: colors.primary
    }
  }),
  selectArrow: css({
    position: 'absolute',
    right: 0,
    top: pxToRem(28),
    pointerEvents: 'none',
    fill: colors.disabled
  }),
  selectArrowBlack: css({
    fill: '#000'
  }),
  selectArrowWhite: css({
    fill: '#fff'
  }),

  white: css({
    backgroundColor: 'transparent',
    color: '#fff',
    borderColor: '#fff',
    ':focus': {
      borderColor: '#fff'
    }
  }),
  black: css({
    backgroundColor: 'transparent',
    color: '#000',
    borderColor: '#000',
    ':focus': {
      borderColor: '#000'
    }
  })
}

export const Label = ({ top, focus, error, text, black, white, children }) => {
  const labelTextStyle = merge(
    styles.labelText,
    top && styles.labelTextTop,
    focus && styles.labelTextFocused,
    error && styles.labelTextError,
    white && styles.white,
    black && styles.black
  )

  return (
    <label {...styles.label}>
      <span {...labelTextStyle}>{text}</span>
      {children}
    </label>
  )
}

export const LSpan = ({ black, white, ...props }) => (
  <span
    {...merge(styles.field, black && styles.black, white && styles.white)}
    {...props}
  />
)

export const LButton = ({ black, white, ...props }) => (
  <button
    {...merge(styles.field, black && styles.black, white && styles.white)}
    {...props}
  />
)

export const LInput = ({ black, white, ...props }) => (
  <input
    {...merge(styles.field, black && styles.black, white && styles.white)}
    {...props}
  />
)

export const LSelect = ({ black, white, ...props }) => [
  <select
    key='select'
    {...merge(
      styles.field,
      styles.select,
      black && styles.black,
      white && styles.white
    )}
    {...props}
  />,
  <svg
    key='arrow'
    {...merge(
      styles.selectArrow,
      black && styles.selectArrowBlack,
      white && styles.selectArrowWhite
    )}
    width={30}
    height={30}
    viewBox='0 0 24 24'
  >
    <path d='M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z' />
  </svg>
]
