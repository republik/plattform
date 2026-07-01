import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import {
  BylineShort,
  Heading,
  LinkOverlay,
} from '@/app/(sanity)/components/teasers/feed/helpers'
import { feedTeaserTypography } from '@/app/(sanity)/components/teasers/feed/styles'
import { FEED_TEASER_FRAGMENT_QUERY_RESULT } from '@/sanity.types'
import { css, cx } from '@republik/theme/css'
import { defineQuery } from 'next-sanity'

export const feedTeaserFragment = /* groq */ `
    _id,
    title,
    description,
    slug,
    heading->{
      _id,
      title,
    },
    theme {
      accentColor
    },
    contributors[]{
      kind,
      "name": contributor->title,
    }
`

// Hack to not rely of the main query for types
export const FEED_TEASER_FRAGMENT_QUERY = defineQuery(
  `*[_type=="article"]{ 
    ${feedTeaserFragment} 
  }`,
)
export type FeedTeaserType =
  NonNullable<FEED_TEASER_FRAGMENT_QUERY_RESULT>[number]

export default function Teaser({
  teaser,
  index,
  skipHeading = false,
}: {
  teaser: FeedTeaserType
  index: number
  skipHeading?: boolean
}) {
  return (
    <div
      className={cx(
        feedTeaserTypography,
        css({
          pb: 8,
          mb: 8,
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderBottomColor: 'divider',
          position: 'relative', // for the link overlay placement
          // exclude last item from border
          '&:last-of-type': { borderBottom: 'none', pb: 0 },
        }),
      )}
    >
      {!skipHeading && <Heading teaser={teaser} />}
      <h4>
        <LinkOverlay teaser={teaser} index={index} />
      </h4>
      <p className='description'>
        <InlinePortableText value={teaser.description} />
      </p>
      <BylineShort teaser={teaser} />
    </div>
  )
}
