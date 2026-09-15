'use client'

import FeedTeaser from '@/app/(sanity)/components/teaser/feed'
import { TeaserSmallFragmentType } from '@/app/(sanity)/groq/teaser-small-fragment'
// TODO: rename ./sanity-helpers to ./helpers once we are fully migrated
import { useTranslation } from '@/lib/withT'
import { css } from '@republik/theme/css'
import { nextReadHeader } from './styles'

export function EditorsRecommendations({
  recommendations,
}: {
  recommendations: TeaserSmallFragmentType[]
}) {
  const { t } = useTranslation()

  if (!recommendations?.length) return null

  return (
    <div
      className={css({
        borderTopWidth: '1px',
        borderTopStyle: 'solid',
        borderTopColor: 'contrast',
        '@media print': { display: 'none' },
      })}
    >
      <div className={nextReadHeader}>
        <h3>{t('nextReads/curatedFeed/title')}</h3>
      </div>
      <div className={css({ pt: 4, pb: 16 })}>
        {recommendations.map((rec, idx) => (
          <FeedTeaser key={idx} teaser={rec} />
        ))}
      </div>
    </div>
  )
}
