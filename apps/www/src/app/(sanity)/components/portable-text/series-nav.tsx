import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { urlFor } from '@/app/(sanity)/lib/urlFor'
import type { SeriesNav } from '@/sanity.types'
import { css } from '@republik/theme/css'
import { getImageDimensions } from '@sanity/asset-utils'
import { defineQuery } from 'next-sanity'
import { Image } from 'next-sanity/image'

const SERIES_NAV_QUERY = defineQuery(
  `*[_type == "articleCollection" && _id == $id][0]{
    _id,
    title,
    description,
    image,

    "episodes": *[_type == "article" && references(^._id)]{
      _id,
      title,
      description,
      image
    }
  }`,
)

export async function SeriesNav({ value }: { value: SeriesNav }) {
  const { data: series } = await sanityFetch({
    query: SERIES_NAV_QUERY,
    params: { id: value.series._ref },
  })

  if (!series) {
    return <div>KEINE SERIE '{value.series._ref}' GEFUNDEN</div>
  }

  return (
    <div
      className={css({
        gridColumn: 'full',
      })}
    >
      <h2>Serie «{series.title}»</h2>

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
          const src = episode.image?.asset
            ? urlFor(episode.image?.asset).url()
            : undefined
          const dimensions = episode.image?.asset
            ? getImageDimensions(src)
            : undefined

          return (
            <div
              key={episode._id}
              className={css({
                display: 'flex',
                flexDirection: 'column',
                gap: '4',
                alignItems: 'center',
                p: '4',
                borderColor: 'divider',
                borderStyle: 'solid',
                borderWidth: '1px',
                width: 'full',
                scrollSnapAlign: 'center',
              })}
            >
              <p>Folge {i + 1}</p>
              {episode.image?.asset && (
                <Image
                  src={src}
                  width={dimensions.width}
                  height={dimensions.height}
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
  )
}
