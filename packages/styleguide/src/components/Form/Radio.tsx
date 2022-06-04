import React from 'react'
import { css } from 'glamor'
import { fontStyles } from '../../theme/fonts'
import { pxToRem } from '../Typography/utils'
import { useColorContext } from '../Colors/useColorContext'

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
  input: css({
    cursor: 'pointer',
    // hidden but accessible
    // https://www.sarasoueidan.com/blog/inclusively-hiding-and-styling-checkboxes-and-radio-buttons/
    position: 'absolute',
    top: 0,
    left: 0,
    width: 24,
    height: 24,
    opacity: 0,
    '&:focus + svg': {
      outline: 'solid',
      outlineOffset: 3,
    },
    '&:focus:not(:focus-visible) + svg': {
      outline: 'none',
    },
  }),
  box: css({
    position: 'relative',
    display: 'inline-block',
    marginRight: 10,
    verticalAlign: 'middle',
  }),
  boxWithouText: css({
    position: 'relative',
    display: 'inline-block',
  }),
}

const RadioCircle = ({ checked, disabled }) => {
  const [colorScheme] = useColorContext()
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      aria-hidden='true'
      focusable='false'
    >
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
          : colorScheme.set('stroke', checked ? 'primary' : 'text'))}
        cx='12'
        cy='12'
        r='11.5'
      />
    </svg>
  )
}

const Radio: React.FC<{
  style?: React.CSSProperties
  name?: string
  value: string
  checked: boolean
  disabled?: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}> = ({ children, style, name, value, checked, disabled, onChange }) => {
  const [colorScheme] = useColorContext()
  return (
    <label
      {...styles.label}
      {...(children ? styles.withText : styles.withoutText)}
      {...(disabled
        ? colorScheme.set('color', 'disabled')
        : colorScheme.set('color', 'text'))}
      style={style}
    >
      <span {...(children ? styles.box : styles.boxWithouText)}>
        <input
          {...styles.input}
          name={name}
          type='radio'
          value={value}
          checked={checked}
          disabled={disabled}
          onChange={onChange}
        />
        <RadioCircle checked={checked} disabled={disabled} />
      </span>
      {children}
    </label>
  )
}

export default Radio
