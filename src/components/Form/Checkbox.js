import React from 'react'
import {css} from 'glamor'
import colors from '../../theme/colors'
import {fontFamilies} from '../../theme/fonts'

const styles = {
  label: css({
    fontSize: 16,
    lineHeight: '20px',
    color: colors.text,
    fontFamily: fontFamilies.sansSerifRegular,
    cursor: 'pointer'
  }),
  input: css({
    display: 'none'
  }),
  unchecked: css({
    display: 'inline-block',
    boxSizing: 'border-box',
    width: 18,
    height: 18,
    border: `1px solid ${colors.secondary}`
  }),
  box: css({
    display: 'inline-block',
    padding: '3px 3px 3px 0',
    marginRight: 5,
    marginTop: -3,
    float: 'left'
  })
}

const Checked = () => (
  <svg width='18' height='18' viewBox='0 0 18 18'>
    <path d='M0 0h18v18H0V0zm7 14L2 9.192l1.4-1.346L7 11.308 14.6 4 16 5.346 7 14z' fill={colors.primary} fillRule='evenodd' />
  </svg>
)

export default ({children, name, checked, onChange}) => (
  <label {...styles.label}>
    <span {...styles.box}>
      {checked
        ? <Checked />
        : <span {...styles.unchecked} />
      }
    </span>
    <input
      {...styles.input}
      name={name}
      type='checkbox'
      checked={checked}
      onChange={(event) => {
        onChange(event, event.target.checked)
      }} />
    {children}
  </label>
)
