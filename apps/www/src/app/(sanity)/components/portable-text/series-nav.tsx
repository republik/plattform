import { getNotExpiredTeasers } from '@/app/(sanity)/components/teaser/_shared/teaser-list-item'
import { InlineTeaser } from '@/app/(sanity)/components/teaser/inline'
import { SERIES_NAV_QUERY } from '@/app/(sanity)/groq/series-nav-query'
import { sanityClientFetch } from '@/app/(sanity)/lib/fetch'
import type { SeriesNav } from '@/sanity.types'
import { css } from '@republik/theme/css'
import { infoboxContent } from '@republik/theme/recipes'

export async function SeriesNav({
  value,
  compact = false,
}: {
  value: SeriesNav
  compact?: boolean
}) {
  const series = await sanityClientFetch(
    SERIES_NAV_QUERY,
    { id: value.series._ref },
    { tag: 'series-nav' },
  )

  if (!series) {
    return null
  }

  const teasers = getNotExpiredTeasers(series.episodes)

  return (
    <>
      <h2
        className={css({
          borderColor: 'current',
          borderStyle: 'solid',
          borderTopWidth: '1px',
          py: '2',
          mb: '2',
          textStyle: 'h3Sans',
        })}
      >
        {series.title}
      </h2>
      <div className={infoboxContent()}>
        {!compact && <p>{series.description}</p>}
      </div>
      <div
        className={css({
          mt: '4',
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
            <InlineTeaser key={i} teaser={episode} />
          ))}
        </div>
      </div>
    </>
  )
}
