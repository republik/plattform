import { css, cx } from '@republik/theme/css'
import { visuallyHidden } from '@republik/theme/patterns'
import { InputHTMLAttributes, ReactNode, useId } from 'react'

const labelStyle = css({
  w: 'full',
  display: 'flex',
  gap: '4',
  alignItems: 'center',
  '&:has(:checked)': {
    borderColor: 'text',
  },
})

export function OfferOptionRadio({
  children,
  ...inputProps
}: {
  value: string
  name: string
  children: ReactNode
} & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  return (
    <label htmlFor={id} className={labelStyle}>
      <input
        {...inputProps}
        id={id}
        type='radio'
        className={cx(
          css({
            flexShrink: 0,
            // Custom checkbox style, see https://moderncss.dev/pure-css-custom-styled-radio-buttons/
            appearance: 'none',
            backgroundColor: 'white',
            margin: '0',
            color: 'current',
            width: '[1.25em]',
            height: '[1.25em]',
            boxSizing: 'border-box',
            borderWidth: 2,
            borderStyle: 'solid',
            borderColor: 'black',
            borderRadius: 'full',
            display: 'grid',
            placeContent: 'center',
            outline: 'none',
            _before: {
              content: '""',
              width: '[0.55em]',
              height: '[0.55em]',
              borderRadius: 'full',
              backgroundColor: 'transparent',
            },

            _checked: {
              backgroundColor: 'white',
              _before: {
                backgroundColor: 'black',
              },
            },
          }),
          inputProps.className,
        )}
      />

      {children}
    </label>
  )
}

export function OfferOptionLabelOnly({
  children,
  ...inputProps
}: {
  value: string
  name: string
  children: ReactNode
} & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  return (
    <label htmlFor={id} className={labelStyle}>
      <input
        {...inputProps}
        id={id}
        type='radio'
        className={cx(visuallyHidden(), inputProps.className)}
      />

      {children}
    </label>
  )
}
