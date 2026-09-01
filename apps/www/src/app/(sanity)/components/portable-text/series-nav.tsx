import { getSeriesLabels } from '@/app/(sanity)/components/series-labels'
import { getNotExpiredTeasers } from '@/app/(sanity)/components/teaser/_shared/teaser-list-item'
import { InlineTeaser } from '@/app/(sanity)/components/teaser/inline'
import { SERIES_NAV_QUERY } from '@/app/(sanity)/groq/series-nav-query'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { Infobox } from '@/app/components/ui/infobox'
import type { SeriesNav } from '@/sanity.types'
import { css } from '@republik/theme/css'
import Link from 'next/link'

export async function SeriesNav({
  value,
  compact = false,
}: {
  value: SeriesNav
  compact?: boolean
}) {
  const { data: series } = await sanityFetch({
    query: SERIES_NAV_QUERY,
    params: { id: value.series._ref },
  })

  if (!series) {
    return null
  }

  const teasers = getNotExpiredTeasers(series.episodes)
  const labels = getSeriesLabels(teasers)

  return (
    <>
      <Infobox title={series.title}>
        {!compact && (
          <p>
            {series.description} <Link href={series.slug}>Zur Übersicht.</Link>
          </p>
        )}
      </Infobox>
      <div
        className={css({
          gridColumn: 'full',
          display: 'flex',
          justifyContent: 'center',
        })}
      >
        <div
          className={css({
            overflowX: 'scroll',
            overflowY: 'hidden',
            scrollSnapType: 'x mandatory',
            display: 'inline-grid',
            gridAutoFlow: 'column',
            gridAutoColumns: 'min(170px, 80vw)',
            gap: '4',
            pb: '8',
            px: '4',
            mx: 'auto',
          })}
        >
          {teasers.map((episode, i) => (
            <InlineTeaser key={i} teaser={episode} label={labels[i]} />
          ))}
        </div>
      </div>
    </>
  )
}
