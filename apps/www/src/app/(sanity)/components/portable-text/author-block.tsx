import type { ArticlePortableTextBlockType } from '@/app/(sanity)/groq/portable-text-content-fragment'
import { dataAttribute } from '@/app/(sanity)/lib/data-attribute'
import { urlFor } from '@/app/(sanity)/lib/urlFor'
import { css, cx } from '@republik/theme/css'
import { Image } from 'next-sanity/image'

type AuthorBlockType = Extract<
  ArticlePortableTextBlockType,
  { _type: 'authorBlock' }
>

export function AuthorBlock({ value }: { value: AuthorBlockType }) {
  if (!value.contributor) {
    return null
  }

  const hasImage = value.contributor?.portraitImage?.asset

  const title = value.displayName ?? value.contributor.title
  const credentialText = value.credentialText ?? value.contributor.shortBio

  return (
    <div
      className={cx(
        css({
          textStyle: 'sans',
          fontSize: 'l',
        }),
        hasImage &&
          css({
            display: 'grid',
            gap: '4',
            gridTemplateColumns: '72px 1fr',
          }),
      )}
    >
      {hasImage && (
        <Image
          src={urlFor(value.contributor.portraitImage)
            .width(72)
            .height(72)
            .url()}
          width={72}
          height={72}
          alt=''
        />
      )}

      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: '1',
          placeContent: 'start center',
        })}
      >
        <div
          className={css({
            fontWeight: 'medium',
          })}
        >
          {title}
        </div>
        {credentialText && <div>{credentialText}</div>}
      </div>
    </div>
  )
}
