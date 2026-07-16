import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { LinkOverlay } from '@/app/(sanity)/components/teaser/_shared/helpers'
import { SquareTeaserImage } from '@/app/(sanity)/components/teaser/_shared/square-teaser-image'
import { typography } from '@/app/(sanity)/components/teaser/_shared/teaser-list-typography'
import { TeaserFragmentType } from '@/app/(sanity)/groq/teaser-fragment'
import { css, cx } from '@republik/theme/css'

export default function GridTeaser({
  teaser,
  label,
  comingSoon = false,
}: {
  teaser: TeaserFragmentType
  label?: string
  comingSoon?: boolean
}) {
  return (
    <div
      style={{ opacity: comingSoon ? 0.5 : 1 }}
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
      {label && <h6>{label}</h6>}
      <SquareTeaserImage
        className={css({
          width: 'full',
          height: 'auto',
        })}
        image={teaser.image}
        alt=''
        size={640}
        sizes='(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw'
      />
      <h4 className='editorial'>
        {comingSoon ? (
          <InlinePortableText value={teaser.title} />
        ) : (
          <LinkOverlay teaser={teaser as TeaserFragmentType} />
        )}
      </h4>
      {teaser.description && (
        <p className='description'>
          <InlinePortableText value={teaser.description} />
        </p>
      )}
    </div>
  )
}
