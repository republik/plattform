import { NextReadDocumentFieldsFragment } from '#graphql/republik-api/__generated__/gql/graphql'
import { InlinePortableText } from '@/app/(sanity)/components/portable-text/portable-text-renderers'
import type { ArticleRecommendation } from '@/app/(sanity)/lib/types'
import { useTrackEvent } from '@/app/lib/analytics/event-tracking'
import { linkOverlay } from '@republik/theme/patterns'
import Link from 'next/link'

export function NextReadAuthor({
  article,
}: {
  article: ArticleRecommendation
}) {
  const authorsNames = article.contributors
    ?.filter((contributor) => contributor.kind?.includes('Text'))
    .map((contributor) => contributor.name)

  if (!authorsNames?.length) return null

  return <p className='author'>Von {authorsNames.join(', ')}</p>
}

// TODO:
//  - merge estimatedReadingMinutes and estimatedConsumptionMinutes -> minutes/timeToEnd (ms ?)
//  - add a sanity function on publish to calculate this data
export function NextReadDuration({
  document,
}: {
  document: NextReadDocumentFieldsFragment
}) {
  const duration =
    document.meta.estimatedReadingMinutes ||
    document.meta.estimatedConsumptionMinutes

  if (!duration) return null

  return <p className='duration'>{duration} min</p>
}

export function CategoryLabel({ article }: { article: ArticleRecommendation }) {
  const label = article.collection
  if (!label) return null

  const color = article.theme?.color?.hex

  return <h5 style={{ color }}>{label}</h5>
}

export function NextReadLink({
  article,
  index,
}: {
  article: ArticleRecommendation
  index: number
}) {
  const trackEvent = useTrackEvent()

  return (
    <Link
      href={article.slug?.current ?? '#'}
      className={linkOverlay()}
      onClick={() => {
        trackEvent({
          action: 'click recommended read',
          slug: article.slug?.current,
          index,
        })
      }}
    >
      <InlinePortableText value={article.title} />
    </Link>
  )
}
