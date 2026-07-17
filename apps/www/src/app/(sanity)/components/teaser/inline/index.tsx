'use client'

import { LinkOverlay } from '@/app/(sanity)/components/teaser/_shared/helpers'
import { TeaserSmallFragmentType } from '@/app/(sanity)/groq/teaser-small-fragment'
import { urlFor } from '@/app/(sanity)/lib/urlFor'
import { css } from '@republik/theme/css'
import { getImageDimensions } from '@sanity/asset-utils'
import { Image } from 'next-sanity/image'
import { usePathname } from 'next/navigation'

export function InlineTeaser({
  teaser,
  label,
}: {
  teaser: TeaserSmallFragmentType
  label?: string
}) {
  const src = teaser.image ? urlFor(teaser.image).width(280).url() : undefined
  const dimensions = src ? getImageDimensions(src) : undefined

  const pathname = usePathname()
  const isCurrentEpisode = pathname === `/articles${teaser.slug}`

  return (
    <div
      key={teaser._id}
      className={css({
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '1',
        alignItems: 'center',
        scrollSnapAlign: 'center',
      })}
    >
      <h6
        className={css({ fontSize: 's', fontFamily: 'gtAmericaStandard' })}
        style={{ fontWeight: isCurrentEpisode ? 500 : 'normal' }}
      >
        {isCurrentEpisode ? `Sie lesen: ${label}` : label}
      </h6>
      {teaser.image && (
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
        <LinkOverlay teaser={teaser} />
      </h5>
    </div>
  )
}
