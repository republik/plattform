import { urlFor } from '@/app/(sanity)/lib/urlFor'
import type { AsideImage } from '@/sanity.types'
import { css } from '@republik/theme/css'
import { getImageDimensions } from '@sanity/asset-utils'
import { useId } from 'react'
import { Caption } from './caption'

export function AsideImage({
  image,
  width = 100,
}: {
  image: AsideImage
  width?: number
}) {
  const captionId = useId()

  const src = urlFor(image)
    .auto('format')
    .width(width * 2)
    .url()

  const dimensions = getImageDimensions(src)

  return (
    <figure
      className={css({
        margin: 0,
        marginBottom: '15px',
        padding: 0,
        width: '100%',
      })}
      // role=group signals the grouping to legacy screen readers and browsers that don't understand the <figure> semantics
      role='group'
      aria-labelledby={captionId}
    >
      {/* We don't use next-sanity/image here because we don't need srcset */}
      <img
        className={css({
          display: 'block',
          width: '100%',
          height: 'auto',
        })}
        src={src}
        alt={image.alt ?? ''}
        width={dimensions.width}
        height={dimensions.height}
        loading='lazy'
        decoding='async'
      />
      {image.caption && <Caption id={captionId} caption={image.caption} />}
    </figure>
  )
}
