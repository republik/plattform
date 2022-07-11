import React from 'react'
import { css } from 'glamor'
import { fontStyles } from '../../theme/fonts'
import { pxToRem } from '../Typography/utils'
import { useColorContext } from '../Colors/useColorContext'

const Checkbox: React.FC<{
  name?: string
  checked: boolean
  disabled?: boolean
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => void
  black?: boolean
  error?: boolean
}> = ({ children, name, checked, disabled, onChange, black, error }) => {
  const [colorScheme] = useColorContext()
  const labelColor = error
    ? colorScheme.set('color', 'error')
    : disabled
    ? colorScheme.set('color', 'disabled')
    : colorScheme.set('color', 'text')

  const checkMarkBorderColor = error
    ? colorScheme.set('borderColor', 'error')
    : disabled
    ? colorScheme.set('borderColor', 'disabled')
    : black
    ? colorScheme.set('borderColor', 'logo')
    : colorScheme.set('borderColor', 'text')

  const checkMarkFill = error
    ? colorScheme.set('fill', 'error')
    : disabled
    ? colorScheme.set('fill', 'disabled')
    : black
    ? colorScheme.set('fill', 'logo')
    : colorScheme.set('fill', 'primary')

  return (
    <label
      {...styles.label}
      {...(children ? styles.withText : styles.withoutText)}
      {...labelColor}
    >
      <span {...(children ? styles.box : styles.boxWithouText)}>
        <input
          {...styles.input}
          name={name}
          type='checkbox'
          checked={checked}
          disabled={disabled}
          onChange={(event) => {
            onChange(event, event.target.checked)
          }}
        />
        {checked ? (
          <svg
            {...checkMarkFill}
            {...styles.outlineOnPrevInputFocus}
            width='18'
            height='18'
            viewBox='0 0 18 18'
            aria-hidden='true'
            focusable='false'
          >
            <path
              d='M0 0h18v18H0V0zm7 14L2 9.192l1.4-1.346L7 11.308 14.6 4 16 5.346 7 14z'
              fill='inherit'
              fillRule='evenodd'
            />
          </svg>
        ) : (
          <span
            aria-hidden='true'
            {...styles.unchecked}
            {...styles.outlineOnPrevInputFocus}
            {...checkMarkBorderColor}
          />
        )}
      </span>
      {children}
    </label>
  )
}

const styles = {
  label: css({
    cursor: 'pointer',
  }),
  withText: css({
    ...fontStyles.sansSerifRegular,
    fontSize: pxToRem(16),
    lineHeight: pxToRem(20),
  }),
  withoutText: css({
    lineHeight: 0,
  }),
  unchecked: css({
    display: 'inline-block',
    boxSizing: 'border-box',
    width: 18,
    height: 18,
    borderWidth: 1,
    borderStyle: 'solid',
  }),
  box: css({
    position: 'relative',
    display: 'inline-block',
    padding: '3px 3px 3px 0',
    marginRight: 5,
    marginTop: -3,
    float: 'left',
  }),
  boxWithouText: css({
    position: 'relative',
    display: 'inline-block',
    padding: '3px 0',
  }),
  outlineOnPrevInputFocus: css({
    'input:focus + &': {
      outline: 'solid',
      outlineOffset: 3,
    },
    'input:focus:not(:focus-visible) + &': {
      outline: 'none',
    },
  }),
  input: css({
    cursor: 'pointer',
    // hidden but accessible
    // https://www.sarasoueidan.com/blog/inclusively-hiding-and-styling-checkboxes-and-radio-buttons/
    position: 'absolute',
    top: 3,
    left: 0,
    width: 18,
    height: 18,
    opacity: 0,
  }),
}

export default Checkbox
