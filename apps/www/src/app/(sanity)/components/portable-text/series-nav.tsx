import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { getSeriesLabels } from '@/app/(sanity)/components/series-labels'
import { SERIES_NAV_QUERY } from '@/app/(sanity)/groq/series-nav-query'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { urlFor } from '@/app/(sanity)/lib/urlFor'
import { Infobox } from '@/app/components/ui/infobox'
import type { SeriesNav } from '@/sanity.types'
import { css } from '@republik/theme/css'
import { getImageDimensions } from '@sanity/asset-utils'
import { Image } from 'next-sanity/image'
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

  const labels = getSeriesLabels(series.episodes)

  return (
    <>
      <Infobox title={series.title}>
        {!compact && (
          <p>
            {series.description}{' '}
            <Link href={`/pages${series.slug}`}>Zur Übersicht.</Link>
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
          {series.episodes?.map((episode, i) => {
            const src = episode.image
              ? urlFor(episode.image).width(280).url()
              : undefined
            const dimensions = src ? getImageDimensions(src) : undefined

            return (
              <div
                key={episode._id}
                className={css({
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1',
                  alignItems: 'center',
                  scrollSnapAlign: 'center',
                })}
              >
                <h6 className={css({ fontSize: 's' })}>{labels[i]}</h6>
                {episode.image && (
                  <Image
                    src={src}
                    width={170}
                    height={170 / dimensions.aspectRatio}
                    alt=''
                  />
                )}
                <h5
                  className={css({
                    textStyle: 'h3Serif',
                    fontSize: 'medium',
                    textAlign: 'left',
                    width: '100%',
                  })}
                >
                  <InlinePortableText value={episode.title} />
                </h5>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
