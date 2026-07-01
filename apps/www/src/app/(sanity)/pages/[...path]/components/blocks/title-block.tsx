import { EditorialImage } from '@/app/(sanity)/components/portable-text/editorial-image'
import type { PAGE_CONTENT_QUERY_RESULT } from '@/sanity.types'
import { css } from '@republik/theme/css'
import Link from 'next/link'

type PageBuilderBlock = NonNullable<
  NonNullable<PAGE_CONTENT_QUERY_RESULT>['pageBuilder']
>[number]

export type TitleBlockBlock = Extract<PageBuilderBlock, { _type: 'titleBlock' }>

/** GROQ projection for the `titleBlock`, resolving its heading reference. */
export const titleBlockFragment = /* groq */ `
  _type == "titleBlock" => {
    heading->{
      _id,
      "title": pt::text(title),
      "slug": slug.current
    }
  }
`

/** A title block: a referenced section heading and an optional cover image. */
export function TitleBlock({ block }: { block: TitleBlockBlock }) {
  const { cover, heading } = block

  if (!cover && !heading) {
    return null
  }

  return (
    <div className={css({ my: 6 })}>
      {heading && (
        <h2 className={css({ textStyle: 'sansSerifMedium', fontSize: 'l', mb: 4 })}>
          {heading.slug ? (
            <Link href={heading.slug}>{heading.title}</Link>
          ) : (
            heading.title
          )}
        </h2>
      )}
      {/* useCoverAsTitle toggles whether the cover stands in for the page title */}
      {cover && <EditorialImage value={cover} />}
    </div>
  )
}
