'use client'

// TODO: rename ./sanity-helpers to ./helpers once we are fully migrated
import { useTranslation } from '@/lib/withT'
import { css, cx } from '@republik/theme/css'
import FeedTeaser, { FeedTeaserType } from '../teasers/feed'
import { nextReadHeader, nextReadsSection } from './styles'

export function ArticleRecommendations({
  recommendations,
}: {
  recommendations: FeedTeaserType[]
}) {
  const { t } = useTranslation()

  if (!recommendations?.length) return null

  return (
    <>
      <div className={nextReadsSection}>
        <div className={cx(nextReadHeader, css({ textAlign: 'left' }))}>
          <h3>{t('nextReads/curatedFeed/title')}</h3>
        </div>
      </div>
      <div className={css({ pt: 4, pb: 16 })}>
        {recommendations.map((rec, index) => (
          <FeedTeaser key={rec._id} teaser={rec} index={index} />
        ))}
      </div>
    </>
  )
}
