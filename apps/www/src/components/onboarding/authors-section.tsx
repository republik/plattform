'use client'

import {
  OnboardingAuthorDocument,
  SubscriptionObjectType,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { OnboardingFollowButton } from '@app/components/onboarding/follow-button'
import { css } from '@republik/theme/css'
import { useState } from 'react'
import { useTranslation } from '../../../lib/withT'
import { Button } from '../ui/button'
import { AUTHORS_FEATURED } from './config'
import { OnboardingH3, OnboardingSection } from './onboarding-ui'

function AuthorCard({ slug, showAll }: { slug: string; showAll: boolean }) {
  const { t } = useTranslation()
  const { data } = useQuery(OnboardingAuthorDocument, {
    variables: { slug },
  })

  const author = data?.user

  const subscriptionId = author?.subscribedBy.nodes.find((n) => n.active)?.id

  return (
    <div
      className={`${css({
        display: 'none',
        alignItems: 'center',
        gap: 2,
        md: {
          maxWidth: '350px',
        },
      })} author-card ${showAll ? 'show-author-card' : ''}`}
    >
      <img
        width='84'
        height='84'
        className={css({
          borderRadius: '96px',
          backgroundColor: 'divider',
        })}
        src={author?.portrait || '/static/profiledefault.png'}
      />
      <div>
        <h4 className={css({ fontWeight: 'bold' })}>{author?.name || '...'}</h4>
        <p className={css({ color: 'textSoft' })}>
          {t(`onboarding/authors/${slug}/beat`)}
        </p>
        <div
          className={css({
            display: 'none',
            md: { display: 'block', mt: 2 },
          })}
        >
          <OnboardingFollowButton
            subscriptionId={subscriptionId}
            objectId={author?.id}
            type={SubscriptionObjectType.User}
          />
        </div>
      </div>
      <div className={css({ ml: 'auto', md: { display: 'none' } })}>
        <OnboardingFollowButton
          subscriptionId={subscriptionId}
          objectId={author?.id}
          type={SubscriptionObjectType.User}
        />
      </div>
    </div>
  )
}

function AuthorsSection() {
  const { t } = useTranslation()
  const [showAll, setShowAll] = useState(false)

  return (
    <OnboardingSection>
      <OnboardingH3>{t('onboarding/authors/title')}</OnboardingH3>
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          // CSS solution to show only first 3 authors on mobile and
          // first 6 on desktop and allow to expand to all authors
          // on all devices
          '& .author-card:nth-child(-n + 3)': {
            display: 'flex',
          },
          '& .author-card.show-author-card': {
            display: 'flex',
          },
          md: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            rowGap: 12,
            '& .author-card:nth-child(-n + 6)': {
              display: 'flex',
            },
          },
        })}
      >
        {AUTHORS_FEATURED.map((slug) => (
          <AuthorCard slug={slug} key={slug} showAll={showAll} />
        ))}
      </div>

      <div
        className={css({
          mt: 8,
          display: 'flex',
          justifyContent: 'center',
          color: 'textSoft',
        })}
      >
        <Button
          variant='link'
          onClick={() => setShowAll(!showAll)}
          type='button'
        >
          {t(`onboarding/authors/${showAll ? 'less' : 'more'}`)}
        </Button>
      </div>
    </OnboardingSection>
  )
}

export default AuthorsSection
