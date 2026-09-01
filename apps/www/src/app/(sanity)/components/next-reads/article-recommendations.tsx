'use client'

import FeedTeaser from '@/app/(sanity)/components/teaser/feed'
import { TeaserSmallFragmentType } from '@/app/(sanity)/groq/teaser-small-fragment'
// TODO: rename ./sanity-helpers to ./helpers once we are fully migrated
import { useTranslation } from '@/lib/withT'
import { css } from '@republik/theme/css'
import { nextReadHeader, nextReadsSection } from './styles'

export function ArticleRecommendations({
  recommendations,
}: {
  recommendations: TeaserSmallFragmentType[]
}) {
  const { t } = useTranslation()

  if (!recommendations?.length) return null

  return (
    <div className={nextReadsSection}>
      <div className={nextReadHeader}>
        <h3 className={css({ textAlign: 'left' })}>
          {t('nextReads/curatedFeed/title')}
        </h3>
      </div>
      <div className={css({ pt: 4, pb: 16, textAlign: 'left' })}>
        {recommendations.map((rec, idx) => (
          <FeedTeaser key={idx} teaser={rec} />
        ))}
      </div>
    </div>
  )
}
