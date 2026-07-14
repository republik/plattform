import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { LinkOverlay } from '@/app/(sanity)/components/teaser/_shared/helpers'
import { SquareTeaserImage } from '@/app/(sanity)/components/teaser/_shared/square-teaser-image'
import { typography } from '@/app/(sanity)/components/teaser/_shared/teaser-list-typography'
import { TeaserFragmentType } from '@/app/(sanity)/groq/teaser-fragment'
import { css, cx } from '@republik/theme/css'

export default function GridTeaser({
  teaser,
  label,
}: {
  teaser: TeaserFragmentType
  label?: string
}) {
  return (
    <div
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
      <SquareTeaserImage image={teaser.image} alt='' size={300} />
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
