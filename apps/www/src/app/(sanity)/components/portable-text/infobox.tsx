import { NestedPortableText } from '@/app/(sanity)/components/portable-text/render'
import type { ArticlePortableTextBlockType } from '@/app/(sanity)/groq/portable-text-content-fragment'
import { Expandable } from '@/app/components/ui/expandable'
import { css, cva, cx } from '@republik/theme/css'
import { infoboxContent } from '@republik/theme/recipes'
import { AsideImage } from './aside-image'

const infoboxContainer = cva({
  base: {
    py: '4',
  },
  variants: {
    size: {
      breakout: {
        gridColumn: 'breakout',
      },
      float: {
        // Not really possible within editorial content grid layout
        gridColumn: 'content',
      },
    },
  },
})

const infoboxLayout = cva({
  base: {
    '--image-width': '155px',
    display: 'grid',
    gap: '0',
    gridTemplateColumns: '1fr',
    md: {
      '&:has(.infobox-image)': {
        gap: '4',
        gridTemplateColumns: 'var(--image-width) 1fr',
      },
    },
  },
  variants: {
    figureSize: {
      S: {
        '--image-width': '155px',
      },
      M: {
        '--image-width': '240px',
      },
      L: {
        '--image-width': '325px',
      },
    },
  },
})

export function InfoBox({
  value,
}: {
  value: Extract<ArticlePortableTextBlockType, { _type: 'infoBox' }>
}) {
  const { title, image, body, collapsible, figureSize, size } = value

  const content = (
    <div className={infoboxLayout({ figureSize })}>
      {image?.asset && (
        <div
          className={cx(
            'infobox-image',
            css({
              maxWidth: 'var(--image-width, 100%)',
            }),
          )}
        >
          <AsideImage image={image} />
        </div>
      )}

      <div
        className={cx(
          css({
            smOnly: {
              display: 'contents',
            },
          }),
        )}
      >
        <h2
          className={css({
            borderColor: 'current',
            borderStyle: 'solid',
            borderTopWidth: '1px',
            py: '2',
            mb: '2',
            textStyle: 'h3Sans',
            smOnly: {
              order: -1,
            },
          })}
        >
          {title}
        </h2>
        <div className={infoboxContent()}>
          <NestedPortableText value={body} />
        </div>
      </div>
    </div>
  )

  return (
    <div className={infoboxContainer({ size })}>
      {collapsible ? <Expandable>{content}</Expandable> : content}
    </div>
  )
}
