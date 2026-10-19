import { toAssetCdnUrl } from '@/app/(sanity)/lib/asset-url'
import Link from '@/app/components/ui/link'
import { css } from '@republik/theme/css'
import type { PortableTextMarkComponentProps } from 'next-sanity'
import type { ReactNode } from 'react'

export function Strong({ children }: { children?: ReactNode }) {
  return <strong>{children}</strong>
}

export function Em({ children }: { children?: ReactNode }) {
  return <em>{children}</em>
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

export function InternalLink({
  text,
  children,
  value,
}: PortableTextMarkComponentProps) {
  const href = value?.slug

  // we don't want links to contributors without profiles
  if (!href && value?.referenceType === 'contributor') {
    return <span>{children}</span>
  }

  if (!href) {
    console.warn('Internal link without href', value, { text })
  }

  // empty internal links are a thing for unpublished linked document
  return (
    <Link href={href ?? '#'} className={linkStyle}>
      {children}
    </Link>
  )
}

export function ExternalLink({
  children,
  value,
}: PortableTextMarkComponentProps) {
  return (
    <a
      href={toAssetCdnUrl(value.href)}
      target='_blank'
      rel='noreferrer'
      className={linkStyle}
    >
      {children}
    </a>
  )
}
