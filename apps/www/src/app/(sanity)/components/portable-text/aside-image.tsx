import { urlFor } from '@/app/(sanity)/lib/urlFor'
import type { AsideImage } from '@/sanity.types'
import { css } from '@republik/theme/css'
import { getImageDimensions } from '@sanity/asset-utils'
import { useId } from 'react'
import { Caption } from './caption'
import { Image } from 'next-sanity/image'

export function AsideImage({
  image,
  width = 100,
}: {
  image: AsideImage
  width?: number
}) {
  const captionId = useId()

  const src = urlFor(image).width(width).url()

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
      <Image
        className={css({
          display: 'block',
          width: '100%',
          height: 'auto',
        })}
        src={src}
        alt={image.alt ?? ''}
        width={width}
        height={width / dimensions.aspectRatio}
      />
      {image.caption && <Caption id={captionId} caption={image.caption} />}
    </figure>
  )
}
