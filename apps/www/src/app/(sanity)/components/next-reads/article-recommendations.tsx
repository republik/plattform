'use client'

// TODO: rename ./sanity-helpers to ./helpers once we are fully migrated
import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import type { ArticleRecommendation } from '@/app/(sanity)/lib/types'
import { useTranslation } from '@/lib/withT'
import { css, cx } from '@republik/theme/css'
import { CategoryLabel, NextReadAuthor, NextReadLink } from './helpers'
import {
  nextReadHeader,
  nextReadItemTypography,
  nextReadsSection,
} from './styles'

function RecommendedRead({
  article,
  index,
}: {
  article: ArticleRecommendation
  index: number
}) {
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
      <p className='description'>
        <InlinePortableText value={article.description} />
      </p>
      <NextReadAuthor article={article} />
    </div>
  )
}

export function ArticleRecommendations({
  recommendations,
}: {
  recommendations: ArticleRecommendation[]
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
          <RecommendedRead key={rec._id} article={rec} index={index} />
        ))}
      </div>
    </>
  )
}
