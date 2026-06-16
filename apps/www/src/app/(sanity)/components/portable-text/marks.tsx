import { css } from '@republik/theme/css'
import type { PortableTextMarkComponentProps } from 'next-sanity'
import Link from 'next/link'
import type { ReactNode } from 'react'

export function Strong({ children }: { children?: ReactNode }) {
  return <strong className={css({ fontWeight: 700 })}>{children}</strong>
}

export function Em({ children }: { children?: ReactNode }) {
  return <em className={css({ fontStyle: 'italic' })}>{children}</em>
}

const subSupBaseAttrs = {
  display: 'inline-block',
  textDecoration: 'none',
  fontSize: '75%',
  lineHeight: '1.4em',
  position: 'relative',
  verticalAlign: 'baseline',
}

export function Sup({ children }: { children?: ReactNode }) {
  return (
    <sup className={css({ ...subSupBaseAttrs, top: '-0.5em' })}>{children}</sup>
  )
}

export function Sub({ children }: { children?: ReactNode }) {
  return (
    <sub className={css({ ...subSupBaseAttrs, bottom: '-0.25em' })}>
      {children}
    </sub>
  )
}

const linkStyle = css({
  textDecoration: 'underline',
  cursor: 'pointer',
})

export function InternalLink({ text, value }: PortableTextMarkComponentProps) {
  const href = value.slug?.current
  return href ? (
    <Link href={href} className={linkStyle}>
      {text}
    </Link>
  ) : (
    text
  )
}

export function ExternalLink({ text, value }: PortableTextMarkComponentProps) {
  return (
    <a href={value.href} target='_blank' rel='noreferrer' className={linkStyle}>
      {text}
    </a>
  )
}
