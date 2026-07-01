import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import type { PAGE_CONTENT_QUERY_RESULT } from '@/sanity.types'
import { css } from '@republik/theme/css'
import { linkOverlay } from '@republik/theme/patterns'
import Link from 'next/link'

type PageBuilderBlock = NonNullable<
  NonNullable<PAGE_CONTENT_QUERY_RESULT>['pageBuilder']
>[number]

/** The resolved article/page reference shared by teaserItem and teaserList. */
export type TeaserData = NonNullable<
  Extract<PageBuilderBlock, { _type: 'teaserItem' }>['reference']
>

/** GROQ projection for a resolved teaser (article or page). */
export const teaserFragment = /* groq */ `
  _id,
  _type,
  title,
  description,
  slug,
  _type == "article" => {
    heading->{
      "title": pt::text(title)
    },
    theme {
      accentColor
    },
    contributors[]{
      kind,
      "name": contributor->title
    }
  }
`

/** Presentational teaser card for a referenced article or page. */
export function Teaser({
  teaser,
  counter,
}: {
  teaser: TeaserData
  counter?: number
}) {
  const href = teaser.slug?.current ?? '#'
  const isArticle = teaser._type === 'article'
  const category = isArticle ? teaser.heading?.title : undefined
  const accentColor = isArticle ? teaser.theme?.accentColor?.hex : undefined
  const authors = isArticle
    ? teaser.contributors
        ?.filter((c) => c.kind?.includes('Text'))
        .map((c) => c.name)
        .filter(Boolean)
    : undefined

  return (
    <div
      className={css({
        position: 'relative', // for the link overlay
        py: 6,
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: 'divider',
      })}
    >
      {(category || counter != null) && (
        <h5
          className={css({ textStyle: 'sansSerifMedium', fontSize: 's' })}
          style={accentColor ? { color: accentColor } : undefined}
        >
          {counter != null && <span>{counter}. </span>}
          {category}
        </h5>
      )}
      <h3 className={css({ textStyle: 'serifTitle', fontSize: 'xl', mt: 1 })}>
        <Link href={href} className={linkOverlay()}>
          <InlinePortableText value={teaser.title} />
        </Link>
      </h3>
      {teaser.description && (
        <p className={css({ textStyle: 'serif', fontSize: 'm', mt: 2 })}>
          <InlinePortableText value={teaser.description} />
        </p>
      )}
      {authors?.length ? (
        <p className={css({ textStyle: 'sans', fontSize: 's', mt: 2 })}>
          Von {authors.join(', ')}
        </p>
      ) : null}
    </div>
  )
}
