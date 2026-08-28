'use client'

import { ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { css } from '@republik/theme/css'
import { vstack, wrap } from '@republik/theme/patterns'

import { client } from '@/app/(sanity)/lib/client'
import { FEATURED_SECTIONS_OVERVIEW_QUERY } from '@/app/(sanity)/groq/featured-sections-overview-query'
import { FEATURED_SECTIONS_OVERVIEW_QUERY_RESULT } from '@/sanity.types'
import { Spinner } from '@/app/components/ui/spinner'

type PageData = FEATURED_SECTIONS_OVERVIEW_QUERY_RESULT
type MenuBlock = NonNullable<NonNullable<PageData>['pageBuilder']>[number]
type MenuItem = {
  key: string
  href: string
  title: string
  color?: string | null
}

function getItems(pages: MenuBlock['pages']): MenuItem[] {
  if (!pages) {
    return []
  }
  return pages
    .map((item): MenuItem | null => {
      if (item._type === 'link') {
        return item.href
          ? { key: item._key, href: item.href, title: item.title || item.href }
          : null
      }
      return item.page?.slug
        ? {
            key: item._key,
            href: item.page.slug,
            title: item.page.title,
            color: item.page.color,
          }
        : null
    })
    .filter((item): item is MenuItem => !!item)
}

function Heading({
  href,
  color,
  children,
}: {
  href?: string | null
  color?: string | null
  children: ReactNode
}) {
  const className = css({
    textStyle: 'h3Sans',
    fontSize: 'base',
    mb: '3',
    _hover: {
      textDecoration: href ? 'underline' : undefined,
      color: color ?? undefined,
    },
  })
  if (!href) {
    return <span className={className}>{children}</span>
  }
  return (
    <h3 className={className}>
      <Link href={href}>{children}</Link>
    </h3>
  )
}

function Tag({
  href,
  color,
  children,
}: {
  href: string
  color?: string | null
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      className={css({ textStyle: 'sansSerifMedium', fontSize: 'l' })}
      style={color ? { color } : undefined}
    >
      {children}
    </Link>
  )
}

function MenuBlockSection({ block }: { block: MenuBlock }) {
  const headingHref = block.heading?.page?.slug
  const headingLabel = block.heading?.title || block.heading?.page?.title
  const headingColor = block.heading?.page?.color
  const items = getItems(block.pages)

  if (!headingLabel && !items.length) {
    return null
  }

  return (
    <>
      {headingLabel && (
        <Heading href={headingHref} color={headingColor}>
          {headingLabel}
        </Heading>
      )}
      <div className={wrap({ align: 'baseline', columnGap: '6', rowGap: '2' })}>
        {items.length > 0 &&
          items.map((item) => (
            <Tag key={item.key} href={item.href} color={item.color}>
              {item.title}
            </Tag>
          ))}
      </div>
    </>
  )
}

// The "Rubriken-Übersicht" page in Sanity (slug "/suche") is what editors use
// to curate this overview, so all the clusters and standalone links below
// come straight from its pageBuilder content.
export function FeaturedSections() {
  const [data, setData] = useState<PageData>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error>()
  const [showSpinner, setShowSpinner] = useState(false)

  useEffect(() => {
    let cancelled = false
    client
      .fetch(FEATURED_SECTIONS_OVERVIEW_QUERY)
      .then((result) => {
        if (!cancelled) {
          setData(result)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!loading) {
      return
    }
    const timer = setTimeout(() => setShowSpinner(true), 500)
    return () => clearTimeout(timer)
  }, [loading])

  if (error || (!loading && !data)) {
    return null
  }

  if (loading) {
    return (
      <div
        className={css({
          display: 'flex',
          justifyContent: 'center',
          minH: '32',
          pt: '8',
        })}
      >
        {showSpinner && <Spinner size='large' />}
      </div>
    )
  }

  const blocks = data?.pageBuilder ?? []

  return (
    <div className={css({ maxW: 'editorial', mx: 'auto' })}>
      <div className={vstack({ gap: '6', alignItems: 'stretch' })}>
        {blocks.map((block) => (
          <div key={block._key}>
            {block.hasSeparator && (
              <hr
                className={css({
                  border: 0,
                  borderTopWidth: '1px',
                  borderTopStyle: 'solid',
                  borderTopColor: 'divider',
                  mb: '6',
                })}
              />
            )}
            <MenuBlockSection block={block} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default FeaturedSections
