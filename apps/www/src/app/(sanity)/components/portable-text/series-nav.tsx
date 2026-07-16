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

export async function SeriesNav({ value }: { value: SeriesNav }) {
  const { data: series } = await sanityFetch({
    query: SERIES_NAV_QUERY,
    params: { id: value.series._ref },
  })

  if (!series) {
    return <div>KEINE SERIE '{value.series._ref}' GEFUNDEN</div>
  }

  const labels = getSeriesLabels(series.episodes)

  return (
    <>
      <Infobox title={series.title}>
        <p>
          {series.description}{' '}
          <Link href={`/pages${series.slug}`}>Zur Übersicht.</Link>
        </p>
      </Infobox>
      <div
        className={css({
          gridColumn: 'full',
        })}
      >
        <div
          className={css({
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            display: 'grid',
            gridAutoFlow: 'column',
            gridAutoColumns: 'min(280px, 80vw)',
            gap: '4',
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
                  p: '1',
                  scrollSnapAlign: 'center',
                })}
              >
                <p>{labels[i]}</p>
                {episode.image && (
                  <Image
                    src={src}
                    width={200}
                    height={200 / dimensions.aspectRatio}
                    alt=''
                  />
                )}
                <h3 className={css({ textStyle: 'h3Serif', fontSize: 'l' })}>
                  <InlinePortableText value={episode.title} />
                </h3>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
