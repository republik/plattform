import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { LinkOverlay } from '@/app/(sanity)/components/teaser/_shared/link-overlay'
import { TeaserImage } from '@/app/(sanity)/components/teaser/_shared/teaser-image'
import {
  TeaserListItemType,
  upcomingTeaser,
} from '@/app/(sanity)/components/teaser/_shared/teaser-list-item'
import { typography } from '@/app/(sanity)/components/teaser/_shared/teaser-list-typography'
import { css, cx } from '@republik/theme/css'

export default function GridTeaser({
  teaser,
  isCurrentArticle = false,
}: {
  teaser: TeaserListItemType
  isCurrentArticle?: boolean
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
      {teaser.label && (
        <h6
          className={css({ fontSize: 's', fontFamily: 'gtAmericaStandard' })}
          style={{ fontWeight: isCurrentArticle ? 500 : 'normal' }}
        >
          {isCurrentArticle ? `Sie lesen: ${teaser.label}` : teaser.label}
        </h6>
      )}
      <TeaserImage
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
