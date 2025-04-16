'use client'

import { Spinner } from './spinner'
import { css, cx } from '@republik/theme/css'
import { button, type ButtonVariantProps } from '@republik/theme/recipes'
import { Slot } from '@radix-ui/react-slot'
import { useMemo } from 'react'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonVariantProps & {
    asChild?: boolean
    loading?: boolean
  }

export const Button = ({
  className,
  variant,
  size,
  asChild = false,
  children,
  loading,
  ...props
}: ButtonProps) => {
  const Comp = asChild ? Slot : 'button'
  const content = useMemo(() => {
    if (!loading) {
      return children
    }
    return (
      <div className={css({ display: 'flex', flexDirection: 'row' })}>
        {children}
        <Spinner />
      </div>
    )
  }, [children, loading])

  return (
    <Comp
      className={cx(
        button({ variant, size }),
        loading && css({ cursor: 'loading' }),
        className,
      )}
      aria-busy={loading}
      {...props}
    >
      {content}
    </Comp>
  )
}
