'use client'

import { ArticleSection } from '@/app/components/ui/section'
import { EventTrackingContext } from '@/app/lib/analytics/event-tracking'
import { useTranslation } from '@/lib/withT'
import { css, cx } from '@republik/theme/css'
import React from 'react'
// TODO: rename ./sanity-helpers to ./helpers once we are fully migrated
import { CategoryLabel, NextReadAuthor, NextReadLink } from './sanity-helpers'
import {
  nextReadHeader,
  nextReadItemTypography,
  nextReadsSection,
} from './styles'

function RecommendedRead({ article, index }) {
  return (
    <div
      className={cx(
        nextReadItemTypography,
        css({
          pb: 8,
          mb: 8,
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderBottomColor: 'divider',
          position: 'relative', // for the link overlay placement
          // exclude last item from border
          '&:last-of-type': { borderBottom: 'none', pb: 0 },
        }),
      )}
    >
      <CategoryLabel article={article} />
      <h4>
        <NextReadLink article={article} index={index} />
      </h4>
      <p className='description'>{article.description}</p>
      <NextReadAuthor article={article} />
    </div>
  )
}

export function ArticleRecommendations({ recommendations }) {
  const { t } = useTranslation()

  if (!recommendations?.length) return null

  return (
    <EventTrackingContext category='NextReads:ArticleRecommendations'>
      <ArticleSection>
        <div className={nextReadsSection}>
          <div className={cx(nextReadHeader, css({ textAlign: 'left' }))}>
            <h3>{t('nextReads/curatedFeed/title')}</h3>
          </div>
        </div>
        <div className={css({ pt: 4, pb: 16 })}>
          {recommendations.map((rec, index) => (
            <RecommendedRead key={rec._id} article={rec} index={index} />
          ))}
        </div>
      </ArticleSection>
    </EventTrackingContext>
  )
}
