import React from 'react'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { fontFamilies } from '../../theme/fonts'

const styles = {
  label: css({
    fontSize: 16,
    lineHeight: '20px',
    fontFamily: fontFamilies.sansSerifRegular,
    cursor: 'pointer'
  }),
  input: css({
    display: 'none'
  }),
  box: css({
    display: 'inline-block',
    marginRight: 10,
    verticalAlign: 'middle'
  }),
  clear: css({
    clear: 'left'
  })
}

const Radio = ({ checked, disabled }) => (
  <svg width='24' height='24' viewBox='0 0 24 24'>
    <circle fill='#fff' stroke='#fff' strokeWidth='6' cx='12' cy='12' r='9' />
    {checked && (
      <circle
        fill={disabled ? colors.disabled : colors.primary}
        cx='12'
        cy='12'
        r='6'
      />
    )}
    <circle
      fill='none'
      stroke={
        checked && !disabled
          ? colors.primary
          : disabled
          ? colors.divider
          : colors.secondary
      }
      cx='12'
      cy='12'
      r='11.5'
    />
  </svg>
)

export default ({
  children,
  style,
  name,
  value,
  checked,
  disabled,
  onChange
}) => (
  <label
    {...styles.label}
    style={{ color: disabled ? colors.disabled : colors.text, ...style }}
  >
    <span {...styles.box}>
      <Radio checked={checked} disabled={disabled} />
    </span>
    <input
      {...styles.input}
      name={name}
      type='radio'
      value={value}
      checked={checked}
      disabled={disabled}
      onChange={onChange}
    />
    {children}
    <span {...styles.clear} />
  </label>
)
