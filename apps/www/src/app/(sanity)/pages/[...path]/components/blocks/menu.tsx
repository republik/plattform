import type { PAGE_CONTENT_QUERY_RESULT } from '@/sanity.types'
import { css } from '@republik/theme/css'
import Link from 'next/link'

type PageBuilderBlock = NonNullable<
  NonNullable<PAGE_CONTENT_QUERY_RESULT>['pageBuilder']
>[number]

export type MenuBlock = Extract<PageBuilderBlock, { _type: 'menu' }>

/** GROQ projection for the `menu` block, resolving heading + page links. */
export const menuFragment = /* groq */ `
  _type == "menu" => {
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
    }
  }
`

/** A navigation menu with an optional heading and a list of links/page refs. */
export function Menu({ block }: { block: MenuBlock }) {
  const items = (block.pages ?? []).flatMap((item) => {
    if (item._type === 'link') {
      return item.href
        ? [{ key: item._key, href: item.href, label: item.title ?? item.href }]
        : []
    }
    return item.page?.slug
      ? [{ key: item._key, href: item.page.slug, label: item.page.title }]
      : []
  })

  const heading = block.heading
  const headingHref = heading?.page?.slug
  const headingLabel = heading?.title ?? heading?.page?.title

  if (!items.length && !headingLabel) {
    return null
  }

  return (
    <nav className={css({ my: 6 })}>
      {block.hasSeparator && (
        <hr
          className={css({
            border: 'none',
            borderTopWidth: 1,
            borderTopStyle: 'solid',
            borderTopColor: 'divider',
            mb: 4,
          })}
        />
      )}
      {headingLabel && (
        <h3 className={css({ textStyle: 'sansSerifMedium', fontSize: 'l', mb: 2 })}>
          {headingHref ? (
            <Link href={headingHref}>{headingLabel}</Link>
          ) : (
            headingLabel
          )}
        </h3>
      )}
      <ul className={css({ listStyle: 'none', display: 'grid', gap: 1 })}>
        {items.map((item) => (
          <li key={item.key}>
            <Link
              href={item.href}
              className={css({
                textStyle: 'sans',
                fontSize: 'm',
                _hover: { textDecoration: 'underline' },
              })}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
