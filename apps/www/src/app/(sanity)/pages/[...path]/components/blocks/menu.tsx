import { sanityFetch } from '@/app/(sanity)/lib/live'
import { css } from '@republik/theme/css'
import { defineQuery } from 'next-sanity'
import Link from 'next/link'

const PAGE_BUILDER_MENU_BLOCK_QUERY = defineQuery(`
  *[_type == "page" && _id == $documentId][0]{
    "block": pageBuilder[_key == $blockKey][0]{
      heading {
        title,
        page->{
          _id,
          "title": pt::text(title),
          "slug": slug.current
        }
      },
      pages[]{
        _key,
        _type,
        _type == "link" => {
          href,
          title
        },
        _type == "reference" => {
          "page": @->{
            _id,
            "title": pt::text(title),
            "slug": slug.current
          }
        }
      },
      hasSeparator
    }
  }
`)

export async function Menu({
  blockKey,
  documentId,
}: {
  blockKey: string
  documentId: string
}) {
  const { data } = await sanityFetch({
    query: PAGE_BUILDER_MENU_BLOCK_QUERY,
    params: { documentId, blockKey },
  })

  if (!data || !data.block) return null

  const { pages, heading, hasSeparator } = data.block

  const items = (pages ?? []).flatMap((item) => {
    if (item._type === 'link') {
      return item.href
        ? [{ key: item._key, href: item.href, label: item.title ?? item.href }]
        : []
    }
    return item.page?.slug
      ? [{ key: item._key, href: item.page.slug, label: item.page.title }]
      : []
  })

  const headingHref = heading?.page?.slug
  const headingLabel = heading?.title ?? heading?.page?.title

  if (!items.length && !headingLabel) {
    return null
  }

  return (
    <nav className={css({ mt: 6 })}>
      {hasSeparator && (
        <hr
          className={css({
            border: 'none',
            borderTopWidth: 1,
            borderTopStyle: 'solid',
            borderTopColor: 'divider',
            mb: '6',
          })}
        />
      )}
      {heading && (
        <h3
          className={css({
            textStyle: 'sansSerifMedium',
            textAlign: 'center',
            color: 'textSoft',
            mb: '2',
          })}
        >
          {headingHref ? (
            <Link href={headingHref}>{headingLabel}</Link>
          ) : (
            headingLabel
          )}
        </h3>
      )}
      <ul
        className={css({
          listStyle: 'none',
          display: 'flex',
          // wrap whole items to the next line instead of overflowing
          flexWrap: 'wrap',
          justifyContent: 'center',
          columnGap: 6,
          rowGap: 1,
        })}
      >
        {items.map((item) => (
          // keep each title on a single line; wrapping happens between items
          <li key={item.key} className={css({ whiteSpace: 'nowrap' })}>
            <Link
              href={item.href}
              className={css({
                textStyle: 'airy',
                color: 'var(--page-theme-accent-color)',
              })}
            >
              <b>{item.label}</b>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
