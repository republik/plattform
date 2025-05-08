import { type AnchorHTMLAttributes } from 'react'

import Link, { type LinkProps } from 'next/link'

import { IconArrowLeft, IconArrowRight } from '@republik/icons'
import { css } from '@republik/theme/css'

export function BackLink({
  children,
  ...props
}: LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <Link {...props}>
      <IconArrowLeft
        size={'1.2em'}
        className={css({
          display: 'inline-block',
          verticalAlign: 'middle',
          mr: '2',
        })}
      />
      <span className={css({ textDecoration: 'underline' })}>{children}</span>
    </Link>
  )
}

export function ArrowLink({
  children,
  ...props
}: LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <Link {...props}>
      <span className={css({ textDecoration: 'underline' })}>{children}</span>
      <IconArrowRight
        size={'1.2em'}
        className={css({
          display: 'inline-block',
          verticalAlign: 'middle',
          ml: '2',
        })}
      />
    </Link>
  )
}
