import { MenuBlockFragmentType } from '@/app/(sanity)/groq/menu-block-fragment'
import { css } from '@republik/theme/css'
import Link from 'next/link'

function MenuItem({ href, title, color }) {
  return (
    <li className={css({ whiteSpace: 'nowrap' })}>
      <Link
        href={href}
        style={{ color }}
        className={css({
          textStyle: 'airy',
        })}
      >
        <b>{title}</b>
      </Link>
    </li>
  )
}

export async function Menu({ menu }: { menu: MenuBlockFragmentType }) {
  const { pages, heading, hasSeparator } = menu

  const headingHref = heading && heading?.page?.slug
  const headingLabel = heading?.title ?? heading?.page?.title

  if (!pages && !headingLabel) {
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
        {pages?.map((item) => (
          <MenuItem
            color={item._type === 'reference' && item.page.color}
            key={item._key}
            href={item._type === 'link' ? item.href : item.page.slug}
            title={
              item._type === 'link' ? item.title ?? item.href : item.page.title
            }
          />
        ))}
      </ul>
    </nav>
  )
}
