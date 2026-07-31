'use client'

import { LinkOverlay } from '@/app/(sanity)/components/teaser/_shared/link-overlay'
import { TeaserImage } from '@/app/(sanity)/components/teaser/_shared/teaser-image'
import {
  TeaserListItemType,
  upcomingTeaser,
} from '@/app/(sanity)/components/teaser/_shared/teaser-list-item'
import { css } from '@republik/theme/css'
import { usePathname } from 'next/navigation'

export function InlineTeaser({
  teaser,
  label,
}: {
  teaser: TeaserListItemType
  label?: string
}) {
  const pathname = usePathname()
  const upcoming = upcomingTeaser(teaser)
  const isCurrentEpisode = 'slug' in teaser && pathname === teaser.slug

  return (
    <div
      key={teaser._id}
      style={{ opacity: upcoming ? 0.5 : 1 }}
      className={css({
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '1',
        alignItems: 'center',
        scrollSnapAlign: 'center',
      })}
    >
      <h6
        className={css({ fontSize: 's', fontFamily: 'gtAmericaStandard' })}
        style={{ fontWeight: isCurrentEpisode ? 500 : 'normal' }}
      >
        {isCurrentEpisode ? `Sie lesen: ${label}` : label}
      </h6>
      <TeaserImage
        image={teaser.image}
        alt=''
        height={480}
        width={640}
        sizes='(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw'
      />
      <h5
        className={css({
          textStyle: 'h3Serif',
          fontSize: 'medium',
          textAlign: 'left',
          width: '100%',
        })}
      >
        <LinkOverlay teaser={teaser} />
      </h5>
    </div>
  )
}
