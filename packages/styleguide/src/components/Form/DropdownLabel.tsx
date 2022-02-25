import React, { useMemo } from 'react'
import { css, merge } from 'glamor'

import { sansSerifRegular22 } from '../Typography/styles'
import { convertStyleToRem, pxToRem } from '../Typography/utils'
import {
  Y_PADDING,
  BORDER_WIDTH,
  LABEL_HEIGHT,
  FIELD_HEIGHT,
} from './constants'
import { useColorContext } from '../Colors/useColorContext'

interface DropdownLabelProps extends Record<string, unknown> {
  top?: boolean
  focus?: boolean
  error?: boolean
  text?: string
  children: React.ReactNode
  Element?: 'span' | 'select' | 'button'
  field?: boolean
  value?: string
  style?: Record<string, string>
  onChange?: (
    event: React.ChangeEvent<
      HTMLSelectElement & HTMLButtonElement & HTMLSpanElement
    >,
  ) => void
  onFocus?: (
    event: React.FocusEvent<
      HTMLSelectElement & HTMLButtonElement & HTMLSpanElement
    >,
  ) => void
  onBlur?: (
    event: React.FocusEvent<
      HTMLSelectElement & HTMLButtonElement & HTMLSpanElement
    >,
  ) => void
}

const styles = {
  field: css({
    display: 'block',
    padding: '7px 0 5px',
    ...convertStyleToRem(sansSerifRegular22),
    lineHeight: pxToRem(27),
    minHeight: pxToRem(FIELD_HEIGHT),
    width: '100%',
    appearance: 'none',
    outline: 'none',
    borderRadius: 0,
    backgroundColor: 'transparent',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    borderBottomWidth: BORDER_WIDTH,
    borderBottomStyle: 'solid',
  }),
  label: css({
    width: '100%',
    paddingTop: pxToRem(LABEL_HEIGHT),
    position: 'relative',
    display: 'block',
  }),
  labelText: css({
    ...convertStyleToRem(sansSerifRegular22),
    lineHeight: pxToRem(20),
    position: 'absolute',
    top: pxToRem(LABEL_HEIGHT + Y_PADDING),
    transition: 'top 200ms, font-size 200ms',
  }),
  labelTextTop: css({
    top: 5,
    fontSize: pxToRem(14),
    lineHeight: pxToRem(15),
  }),
  select: css({
    position: 'absolute',
    top: pxToRem(LABEL_HEIGHT),
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
  }),
  selectArrow: css({
    position: 'absolute',
    right: 0,
    top: pxToRem(28),
    pointerEvents: 'none',
  }),
}

export const Label = ({
  top,
  focus,
  error,
  text,
  children,
  Element = 'span',
  field,
  value,
  style,
  onChange,
  onFocus,
  onBlur,
  ...props
}: DropdownLabelProps) => {
  const [colorScheme] = useColorContext()
  const labelTextStyle = merge(styles.labelText, top && styles.labelTextTop)
  const isSelect = Element === 'select'
  const styleRules = useMemo(() => {
    return {
      field: css({
        borderColor: colorScheme.getCSSColor('disabled'),
        ':focus': {
          borderColor: colorScheme.getCSSColor('primary'),
        },
      }),
      select: css({
        ':focus + svg': {
          fill: colorScheme.getCSSColor('primary'),
        },
      }),
    }
  }, [colorScheme])

  if (field) {
    return (
      <>
        <Element
          {...props}
          value={value}
          style={style}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          {...merge(
            styles.field,
            styleRules.field,
            isSelect && styles.select,
            isSelect && styleRules.select,
          )}
          {...(error
            ? colorScheme.set('color', 'error')
            : focus
            ? colorScheme.set('color', 'primary')
            : colorScheme.set('color', 'text'))}
        >
          {children}
        </Element>
        {Element === 'select' ? (
          <svg
            key='arrow'
            {...styles.selectArrow}
            {...colorScheme.set('fill', 'disabled')}
            width={30}
            height={30}
            viewBox='0 0 24 24'
          >
            <path d='M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z' />
          </svg>
        ) : null}
      </>
    )
  }

  return (
    <label {...styles.label}>
      <span
        {...merge(labelTextStyle, isSelect && styleRules.select)}
        {...(error
          ? colorScheme.set('color', 'error')
          : focus
          ? colorScheme.set('color', 'primary')
          : colorScheme.set('color', 'disabled'))}
      >
        {text}
      </span>
      {children}
    </label>
  )
}
