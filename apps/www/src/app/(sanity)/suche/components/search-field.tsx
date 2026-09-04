'use client'

import { useState, type ReactNode } from 'react'
import { css, cx } from '@republik/theme/css'

// Search-specific port of the legacy @project-r/styleguide Field (floating
// label, no error/disabled states needed here), following the panda-native
// pattern already established by app/components/ui/form.tsx's FormField --
// colors reference panda tokens by name directly (no CSS custom-property
// bridge to a legacy component needed, unlike the styleguide Field this
// replaces).
const LINE_HEIGHT = 20
const FIELD_HEIGHT = 40
const Y_PADDING = 9

const containerStyle = css({
  width: 'full',
  pt: `${LINE_HEIGHT}px`,
  position: 'relative',
  display: 'inline-block',
  fontSize: 22,
  lineHeight: `${LINE_HEIGHT}px`,
  mb: '15px',
  cursor: 'text',
})

const fieldStyle = css({
  width: 'full',
  appearance: 'none',
  outline: 'none',
  verticalAlign: 'bottom',
  textDecoration: 'none',
  height: `${FIELD_HEIGHT}px`,
  fontSize: 22,
  boxSizing: 'border-box',
  border: 'none',
  borderBottomWidth: '1px',
  borderBottomStyle: 'solid',
  borderRadius: 0,
  backgroundColor: 'transparent',
})

const fieldWithIconStyle = css({ pr: `${FIELD_HEIGHT}px` })

const labelTextStyle = css({
  position: 'absolute',
  left: 0,
  top: `${LINE_HEIGHT + Y_PADDING}px`,
  transition: 'top 200ms, font-size 200ms',
})

const labelTextFloatingStyle = css({
  top: '3px',
  fontSize: 12,
  lineHeight: '13px',
  md: { top: '5px', fontSize: 14, lineHeight: '15px' },
})

const iconWrapperStyle = css({
  position: 'absolute',
  right: '3px',
  top: `${LINE_HEIGHT + 5}px`,
})

export function SearchField({
  name,
  label,
  value,
  onChange,
  icon,
}: {
  name?: string
  label: string
  value: string
  onChange: (value: string) => void
  icon?: ReactNode
}) {
  const [isFocused, setIsFocused] = useState(false)
  const hasValue = value.length > 0
  const isFloating = isFocused || hasValue

  return (
    <label className={containerStyle}>
      <input
        name={name}
        type='text'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cx(
          fieldStyle,
          icon && fieldWithIconStyle,
          css({
            borderColor: isFocused ? 'primary' : 'divider',
            color: 'text',
          }),
        )}
      />
      <span
        className={cx(
          labelTextStyle,
          isFloating && labelTextFloatingStyle,
          css({ color: isFocused ? 'primary' : 'disabled' }),
        )}
      >
        {label}
      </span>
      {icon && <span className={iconWrapperStyle}>{icon}</span>}
    </label>
  )
}
