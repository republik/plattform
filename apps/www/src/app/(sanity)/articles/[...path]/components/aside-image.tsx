import { urlFor } from '@/app/(sanity)/lib/urlFor'
import { css } from '@republik/theme/css'
import { Caption } from './caption'

export function AsideImage({ image, width = 100 }) {
  const src = urlFor(image)
    .auto('format')
    .width(width * 2)
    .url()
  return (
    <figure
      className={css({
        margin: 0,
        marginBottom: '15px',
        padding: 0,
        width: '100%',
      })}
    >
      <img
        className={css({
          display: 'block',
          width: '100%',
          height: 'auto',
        })}
        src={src}
        alt={image.alt ?? ''}
        width={width}
      />
      {image.caption && <Caption caption={image.caption} />}
    </figure>
  )
}
