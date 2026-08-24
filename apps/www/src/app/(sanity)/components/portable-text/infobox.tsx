import { NestedPortableText } from '@/app/(sanity)/components/portable-text/render'
import type { ArticlePortableTextBlockType } from '@/app/(sanity)/groq/portable-text-content-fragment'
import { Infobox } from '@/app/components/ui/infobox'
import { css, cx } from '@republik/theme/css'
import { AsideImage } from './aside-image'

export function InfoBox({
  value,
}: {
  value: Extract<ArticlePortableTextBlockType, { _type: 'infoBox' }>
}) {
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

      <Infobox title={title}>
        <NestedPortableText value={body} />
      </Infobox>
    </div>
  )
}
