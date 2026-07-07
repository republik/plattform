import { MenuBlockFragmentType } from '@/app/(sanity)/groq/menu-block-fragment'
import { css } from '@republik/theme/css'
import Link from 'next/link'

export async function Menu({ menu }: { menu: MenuBlockFragmentType }) {
  const { pages, heading, hasSeparator } = menu

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
          flexWrap: 'wrap',
          justifyContent: 'center',
          columnGap: 6,
          rowGap: 1,
        })}
      >
        {items.map((item) => (
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
