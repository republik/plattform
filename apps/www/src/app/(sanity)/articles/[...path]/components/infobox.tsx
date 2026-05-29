import { editorialWidth } from '@/app/(sanity)/articles/[...path]/styles'
import { urlFor } from '@/app/(sanity)/lib/urlFor'
import { css, cx } from '@republik/theme/css'
import { PortableText } from 'next-sanity'

const caption = css({
  margin: '5px auto 0 auto',
  width: '100%',
  fontFamily: 'gtAmericaStandard',
  fontSize: '12px',
  lineHeight: '15px',
  color: 'text',
  md: {
    fontSize: '15px',
    lineHeight: '18px',
  },
})

function InfoBoxImage({ image }) {
  const src = urlFor(image).auto('format').width(384).url()
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
      />
      {image.credit && (
        <figcaption className={caption}>{image.credit}</figcaption>
      )}
    </figure>
  )
}

export function InfoBox({ value }) {
  const { title, image, body } = value

  const hasImage = image?.asset

  return (
    <div
      className={cx(
        css({
          py: '4',
          borderColor: 'current',
          borderStyle: 'solid',
          borderTopWidth: '1px',
          borderBottomWidth: '1px',
          ...editorialWidth,
        }),
        hasImage &&
          css({
            display: 'grid',
            gridTemplateColumns: '99px 1fr',
            gap: '4',
          }),
      )}
    >
      {image?.asset && <InfoBoxImage image={image} />}

      <div>
        <h2 className={css({ textStyle: 'h3Sans' })}>{title}</h2>
        <PortableText value={body} />
      </div>
    </div>
  )
}
