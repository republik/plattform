'use client'

import { SubscriptionFieldsFragment } from '#graphql/republik-api/__generated__/gql/graphql'
import FollowAuthorCard from '@app/components/follow/follow-author-card'
import { Button } from '@app/components/ui/button'
import { ArticleSection } from '@app/components/ui/section'
import { css } from '@republik/theme/css'
import { useState } from 'react'
import { useTranslation } from '../../../lib/withT'

const MAX_AUTHORS = 3

function FollowAuthors({
  subscriptions,
}: {
  subscriptions: SubscriptionFieldsFragment[]
}) {
  const [showAll, setShowAll] = useState(false)
  const { t } = useTranslation()

  if (subscriptions?.length === 0) return null

  return (
    <div className={css({ marginTop: 8 })}>
      <ArticleSection>
        {subscriptions
          .slice(0, showAll ? subscriptions.length : MAX_AUTHORS)
          .map((sub) => (
            <FollowAuthorCard key={sub.id} subscription={sub} />
          ))}
        {subscriptions.length > MAX_AUTHORS && !showAll && (
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
