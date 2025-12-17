'use client'

import { getFragmentData } from '#graphql/republik-api/__generated__/gql'
import {
  OnboardingAuthorDocument,
  SubscriptionFieldsFragment,
  SubscriptionFieldsFragmentDoc,
  SubscriptionFieldsUserFragmentDoc,
  SubscriptionObjectType,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { FollowButton } from '@app/components/follow/follow-button'
import { Section, SectionH3 } from '@app/components/ui/section'
import { css } from '@republik/theme/css'
import { useState } from 'react'
import { useTranslation } from '../../../lib/withT'
import { Button } from '../ui/button'
import { AUTHORS_FEATURED, AuthorType } from './config'

function AuthorCard({
  subscription,
}: {
  subscription: SubscriptionFieldsFragment
}) {
  const { t } = useTranslation()

  if (!subscription) {
    return null
  }

  const author =
    subscription.object.__typename === 'User' &&
    getFragmentData(SubscriptionFieldsUserFragmentDoc, subscription.object)

  const subscriptionId = subscription.active && subscription.id

  return (
    <div
      className={css({
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        md: {
          maxWidth: '350px',
        },
      })}
    >
      <img
        width='84'
        height='84'
        className={css({
          borderRadius: '96px',
          backgroundColor: 'divider',
        })}
        src={author.portrait}
      />
      <div>
        <h4 className={css({ fontWeight: 'bold' })}>{author.name}</h4>
        <p className={css({ color: 'textSoft' })}>
          {t(`onboarding/authors/${author.slug}/beat`)}
        </p>
        <div
          className={css({
            display: 'none',
            md: { display: 'block', mt: 2 },
          })}
        >
          <FollowButton
            subscriptionId={subscriptionId}
            objectId={author.id}
            type={SubscriptionObjectType.User}
          />
        </div>
      </div>
      <div className={css({ ml: 'auto', md: { display: 'none' } })}>
        <FollowButton
          subscriptionId={subscriptionId}
          objectId={author.id}
          type={SubscriptionObjectType.User}
        />
      </div>
    </div>
  )
}

function OnboardingAuthor({
  author,
  showAll,
}: {
  author: AuthorType
  showAll: boolean
}) {
  const { data } = useQuery(OnboardingAuthorDocument, {
    variables: { id: author.id },
  })

  const subscriptions = data?.user?.subscribedBy?.nodes?.map((subscription) =>
    getFragmentData(SubscriptionFieldsFragmentDoc, subscription),
  )

  if (!subscriptions) return null

  const subscription = subscriptions.length && subscriptions[0]

  return (
    <div
      className={`${css({
        display: 'none',
      })} author-card ${showAll ? 'show-author-card' : ''}`}
    >
      <AuthorCard subscription={subscription} />
    </div>
  )
}

function AuthorsSection() {
  const { t } = useTranslation()
  const [showAll, setShowAll] = useState(false)

  return (
    <Section>
      <SectionH3>{t('onboarding/authors/title')}</SectionH3>
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
        {AUTHORS_FEATURED.map((author) => (
          <OnboardingAuthor
            author={author}
            key={author.slug}
            showAll={showAll}
          />
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
    </Section>
  )
}

export default AuthorsSection
