import { NestedPortableText } from '@/app/(sanity)/components/portable-text/render'
import { Infobox } from '@/app/components/ui/infobox'
import type { InfoBox as InfoBoxType } from '@/sanity.types'
import { css, cx } from '@republik/theme/css'
import { AsideImage } from './aside-image'

export function InfoBox({ value }: { value: InfoBoxType }) {
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
