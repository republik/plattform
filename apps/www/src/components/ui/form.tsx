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
