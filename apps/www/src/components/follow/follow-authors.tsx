'use client'

import FollowAuthorCard from '@app/components/follow/follow-author-card'
import { Button } from '@app/components/ui/button'
import { ArticleSection } from '@app/components/ui/section'
import { css } from '@republik/theme/css'
import { useState } from 'react'
import { useTranslation } from '../../../lib/withT'

const MAX_AUTHORS = 3

function FollowAuthors({ authorIds }: { authorIds: string[] }) {
  const [showAll, setShowAll] = useState(false)
  const { t } = useTranslation()

  if (authorIds?.length === 0) return null

  return (
    <div className={css({ mt: 8, mb: 16 })}>
      <ArticleSection>
        {authorIds
          .slice(0, showAll ? authorIds.length : MAX_AUTHORS)
          .map((authorId) => (
            <FollowAuthorCard key={authorId} authorId={authorId} />
          ))}
        {authorIds.length > MAX_AUTHORS && !showAll && (
          <div
            className={css({
              mt: 8,
              display: 'flex',
              color: 'textSoft',
            })}
          >
            <Button
              variant='link'
              onClick={() => setShowAll(true)}
              type='button'
            >
              {t('follow/authors/all')}
            </Button>
          </div>
        )}
      </ArticleSection>
    </div>
  )
}

export default FollowAuthors
