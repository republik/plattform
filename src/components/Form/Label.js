import React from 'react'
import {css, merge} from 'glamor'

import colors from '../../theme/colors'
import {sansSerifRegular21} from '../Typography/styles'

const borderWidth = 1
export const labelHeight = 20 // The height of the area at the top for the label.
export const fieldHeight = 40

const styles = {
  label: css({
    width: '100%',
    paddingTop: labelHeight,
    position: 'relative',
    display: 'block',
  }),
  labelText: css({
    ...sansSerifRegular21,
    color: colors.disabled,

    position: 'absolute',
    top: labelHeight,
    transition: 'top 200ms, font-size 200ms'
  }),
  labelTextTop: css({
    top: 5,
    fontSize: 14,
    lineHeight: '15px',
  }),
  labelTextFocused: css({
    color: colors.primary
  }),
  labelTextError: css({
    color: colors.error
  }),

  button: css({
    ...sansSerifRegular21,
    fontSize: 22,
    color: colors.text,
    width: '100%',
    display: 'block',
    appearance: 'none',
    outline: 'none',
    backgroundColor: 'white',
    border: 'none',
    padding: '0',
    textAlign: 'left',
    cursor: 'pointer',
    height: fieldHeight,
    borderBottom: `solid ${colors.disabled} ${borderWidth}px`,
    ':focus': {
      borderColor: colors.primary
    }
  }),

  input: css({
    ...sansSerifRegular21,
    fontSize: 22,
    color: colors.text,
    width: '100%',
    display: 'block',
    appearance: 'none',
    outline: 'none',
    backgroundColor: 'white',
    border: 'none',
    padding: '0',
    textAlign: 'left',
    cursor: 'pointer',
    height: fieldHeight,
    borderBottom: `solid ${colors.disabled} ${borderWidth}px`,
    ':focus': {
      borderColor: colors.primary
    }
  }),

  select: css({
    ...sansSerifRegular21,
    fontSize: 22,
    color: colors.text,
    width: '100%',
    display: 'block',
    appearance: 'none',
    outline: 'none',
    backgroundColor: 'white',
    border: 'none',
    borderRadius: 0,
    padding: '0',
    textAlign: 'left',
    cursor: 'pointer',
    height: fieldHeight,
    borderBottom: `solid ${colors.disabled} ${borderWidth}px`,
    ':focus': {
      borderColor: colors.primary
    },
    ':focus + svg': {
      fill: colors.primary
    }
  }),
  selectArrow: css({
    position: 'absolute',
    right: 0  ,
    top: 28,
    pointerEvents: 'none',
    fill: colors.disabled
  })
}

export const Label = ({top, focus, error, text, children}) => {
  const labelTextStyle = merge(
    styles.labelText,
    top && styles.labelTextTop,
    focus && styles.labelTextFocused,
    error && styles.labelTextError
  )

  return (
    <label {...styles.label}>
      <span {...labelTextStyle}>{text}</span>
      {children}
    </label>
  )
}

export const LButton = props =>
  <button {...styles.button} {...props} />

export const LInput = props =>
  <input {...styles.button} {...props} />

export const LSelect = props => [
  <select key='select' {...styles.select} {...props} />,
  <svg key='arrow' {...styles.selectArrow} width={30} height={30} viewBox='0 0 24 24'>
    <path d='M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z' />
  </svg>
]
