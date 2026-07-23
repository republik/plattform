import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { LinkOverlay } from '@/app/(sanity)/components/teaser/_shared/helpers'
import { TeaserImage } from '@/app/(sanity)/components/teaser/_shared/teaser-image'
import {
  TeaserListItemType,
  upcomingTeaser,
} from '@/app/(sanity)/components/teaser/_shared/teaser-list-item'
import { typography } from '@/app/(sanity)/components/teaser/_shared/teaser-list-typography'
import { css, cx } from '@republik/theme/css'

export default function GridTeaser({
  teaser,
  label,
}: {
  teaser: TeaserListItemType
  label?: string
}) {
  const upcoming = upcomingTeaser(teaser)

  return (
    <div
      style={{ opacity: upcoming ? 0.5 : 1 }}
      className={cx(
        typography,
        css({
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '2',
        }),
      )}
    >
      {label && <h6 dangerouslySetInnerHTML={{ __html: label }} />}
      <TeaserImage
        className={css({
          width: 'full',
          height: 'auto',
        })}
        image={teaser.image}
        alt=''
        width={640}
        height={480}
        sizes='(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw'
      />
      <h4 className='editorial'>
        <LinkOverlay teaser={teaser} />
      </h4>
      {teaser.description && (
        <p className='description'>
          <InlinePortableText value={teaser.description} />
        </p>
      )}
    </div>
  )
}
