import { css, cx } from '@republik/theme/css'
import { PortableText } from 'next-sanity'
import { AsideImage } from './aside-image'
import type { InfoBox } from '@/sanity.types'
import { NestedPortableText } from '@/app/(sanity)/components/portable-text/render'

export function InfoBox({ value }: { value: InfoBox }) {
  const { title, image, body } = value

  const hasImage = image?.asset

  return (
    <div
      className={cx(
        css({
          py: '4',
        }),
        hasImage &&
          css({
            display: 'grid',
            gridTemplateColumns: '99px 1fr',
            gap: '4',
          }),
      )}
    >
      {image?.asset && <AsideImage image={image} />}

      <div className={css({ '& p': { ml: '0', mr: '0' } })}>
        <h3
          className={css({
            textStyle: 'h3Sans',
            borderColor: 'current',
            borderStyle: 'solid',
            borderTopWidth: '1px',
            py: '2',
            fontSize: { base: 'base', md: 'l' },
          })}
        >
          {title}
        </h3>
        <div
          className={css({
            textStyle: 'sans',
            lineHeight: '1.5',
            fontSize: { base: 'base', md: 'l' },
          })}
        >
          <NestedPortableText value={body} />
        </div>
      </div>
    </div>
  )
}
