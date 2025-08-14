'use client'
import { css, cx } from '@republik/theme/css'
import { visuallyHidden } from '@republik/theme/patterns'
import { type InputHTMLAttributes, type ReactNode, useId } from 'react'

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  name: string
  description?: ReactNode
  hideLabel?: boolean
}

export function FormField({
  label,
  error,
  name,
  type = 'text',
  description,
  hideLabel,
  ...inputProps
}: FormFieldProps) {
  const id = useId()

  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5',
        width: 'full',
      })}
      data-invalid={error ? 'true' : undefined}
    >
      <label
        htmlFor={id}
        className={cx(
          css({
            fontSize: 's',
            display: 'block',
            color: 'text.secondary',
            textAlign: 'left',
            fontWeight: 'medium',
          }),
          hideLabel && visuallyHidden(),
        )}
      >
        {label}
      </label>
      <input
        {...inputProps}
        id={id}
        name={name}
        type={type}
        className={cx(
          css({
            background: 'white',
            borderWidth: '1px',
            borderColor: 'black',
            borderRadius: '5px',
            color: 'black',
            lineHeight: 1.5,
            p: '2',
            _disabled: {
              color: 'text.secondary',
              background: 'disabled',
            },
            _placeholder: {
              color: 'text.tertiary',
              fontWeight: 'normal',
            },
          }),
          error && css({ borderColor: 'error' }),
          inputProps?.className,
        )}
      />
      {error && (
        <div
          aria-live='polite'
          className={css({
            color: 'error',
            fontSize: 'sm',
          })}
        >
          {error}
        </div>
      )}
      {description && (
        <div
          className={css({
            color: 'text.tertiary',
            fontSize: 'xs',
          })}
        >
          {description}
        </div>
      )}
    </div>
  )
}

export function RadioOption({
  children,
  hideRadio,
  ...inputProps
}: {
  value: string
  name: string
  children: ReactNode
  hideRadio?: boolean
} & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  return (
    <label
      htmlFor={id}
      className={css({
        // borderWidth: 2,
        // borderStyle: "solid",
        // borderRadius: "5px",
        // borderColor: "disabled",
        w: 'full',
        display: 'flex',
        gap: '4',
        alignItems: 'center',
        '&:has(:checked)': {
          borderColor: 'text',
        },
        // fontSize: "xl",
      })}
    >
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
          hideRadio && visuallyHidden(),
          inputProps.className,
        )}
      />

      {children}
    </label>
  )
}
