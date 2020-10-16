import React from 'react'
import { css } from 'glamor'
import { fontFamilies } from '../../theme/fonts'
import { useColorContext } from '../Colors/useColorContext'

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

const Radio = ({ checked, disabled }) => {
  const [colorScheme] = useColorContext()
  return (
    <svg width='24' height='24' viewBox='0 0 24 24'>
      <circle fill='none' cx='12' cy='12' r='9' />
      {checked && (
        <circle
          {...(disabled
            ? colorScheme.set('fill', 'disabled')
            : colorScheme.set('fill', 'primary'))}
          cx='12'
          cy='12'
          r='6'
        />
      )}
      <circle
        fill='none'
        {...(disabled
          ? colorScheme.set('stroke', 'divider')
          : colorScheme.set('stroke', 'primary'))}
        cx='12'
        cy='12'
        r='11.5'
      />
    </svg>
  )
}

export default ({
  children,
  style,
  name,
  value,
  checked,
  disabled,
  onChange
}) => {
  const [colorScheme] = useColorContext()
  return (
    <label
      {...styles.label}
      {...(disabled
        ? colorScheme.set('color', 'disabled')
        : colorScheme.set('color', 'text'))}
      style={{ ...style }}
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
}
