import React from 'react'
import { css, merge } from 'glamor'
import colors from '../../theme/colors'
import { fontFamilies } from '../../theme/fonts'
import { pxToRem } from '../Typography/utils'

const styles = {
  label: css({
    fontSize: pxToRem(16),
    lineHeight: pxToRem(20),
    color: colors.text,
    fontFamily: fontFamilies.sansSerifRegular,
    cursor: 'pointer'
  }),
  labelDisabled: css({
    color: colors.disabled
  }),
  labelError: css({
    color: colors.error
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
  disabled: css({
    border: `1px solid ${colors.disabled}`
  }),
  uncheckedBlack: css({
    borderColor: '#000000'
  }),
  uncheckedError: css({
    borderColor: colors.error
  }),
  box: css({
    display: 'inline-block',
    padding: '3px 3px 3px 0',
    marginRight: 5,
    marginTop: -3,
    float: 'left'
  })
}

const Checked = ({ disabled, black, error }) =>
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path
      d="M0 0h18v18H0V0zm7 14L2 9.192l1.4-1.346L7 11.308 14.6 4 16 5.346 7 14z"
      fill={(disabled && colors.disabled) || (error && colors.error) || (black && '#000000') || colors.primary}
      fillRule="evenodd"
    />
  </svg>

export default ({ children, name, checked, disabled, onChange, black, error }) =>
  <label
    {...merge(styles.label, disabled && styles.labelDisabled, error && styles.labelError)}
  >
    <span {...styles.box}>
      {checked
        ? <Checked disabled={disabled} black={black} error={error} />
        : <span {...merge(
          styles.unchecked,
          disabled && styles.disabled,
          black && styles.uncheckedBlack,
          error && styles.uncheckedError
        )} />}
    </span>
    <input
      {...styles.input}
      name={name}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={event => {
        onChange(event, event.target.checked)
      }}
    />
    {children}
  </label>
