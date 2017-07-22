import * as React from 'react'
import { css, StyleAttribute } from 'glamor'
import {
  Label,
  colors,
  fontFamilies
} from '@project-r/styleguide'

const styles = {
  container: {
    checkbox: css({
      display: 'flex',
      justifyContent: 'space-between',
      'max-width': '25%'
    })
  },
  input: css({
    borderWidth: '0 0 1px 0',
    borderColor: colors.divider,
    fontSize: '1em',
    width: '99%',
    height: '20px',
    fontFamily: fontFamilies.sansSerifRegular,
    ':focus': {
      borderColor: colors.primary,
      outline: 'none'
    },
    '[type="date"]': {
      height: '22px'
    },
    '[type="checkbox"]': {
      width: '22px'
    }
  })
}

interface InputProps {
  [key: string]: any
  label: string
  type: string
  name?: string
  value?: any
  onChange?: any
  checked?: boolean
}

export default ({
  value,
  type,
  name,
  onChange,
  label,
  checked,
  ...props
}: InputProps) =>
  <div
    {...props}
    className={
      type === 'checkbox'
        ? `${styles.container.checkbox}`
        : ''
    }
  >
    <Label>
      {label}
    </Label>
    <input
      name={name}
      className={`${styles.input}`}
      type={type}
      value={value}
      onChange={onChange}
      checked={checked}
    />
  </div>
