'use client'

import { getFragmentData } from '#graphql/republik-api/__generated__/gql'
import {
  OnboardingFormatsDocument,
  SubscriptionFieldsDocumentFragment,
  SubscriptionFieldsDocumentFragmentDoc,
  SubscriptionFieldsFragment,
  SubscriptionFieldsFragmentDoc,
  SubscriptionObjectType,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { FollowButton } from '@app/components/follow/follow-button'
import { Section, SectionH3 } from '@app/components/ui/section'
import { css } from '@republik/theme/css'
import { useTranslation } from '../../../lib/withT'
import { PODCASTS_FEATURED, PODCASTS_STYLE } from './config'

function PodcastCard({
  subscription,
}: {
  subscription?: SubscriptionFieldsFragment & {
    object: SubscriptionFieldsDocumentFragment
  }
}) {
  const { t } = useTranslation()

  if (!subscription) return null

  const podcast = subscription.object

  const subscriptionId = subscription.active && subscription.id

  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
      })}
    >
      <div
        style={PODCASTS_STYLE[podcast.repoId]}
        className={css({
          display: 'flex',
          flexDirection: 'column',
          aspectRatio: '1/1',
          padding: 2,
          mb: 2,
          justifyContent: 'space-between',
          fontSize: '3xl',
          fontFamily: 'republikSerif',
          lineHeight: '0.9',
          lg: {
            fontSize: '4xl',
          },
        })}
      >
        <h4
          className={css({
            textAlign: 'right',
          })}
        >
          {t(`onboarding/podcasts/${podcast.repoId}/title`)}
        </h4>
        <span
          className={css({
            lineHeight: 0.5,
            color: 'white',
          })}
        >
          R
        </span>
      </div>
      <p
        className={css({
          textStyle: 'body',
          mt: 1,
        })}
      >
        {t(`onboarding/podcasts/${podcast.repoId}/description`)}
      </p>
      <div className={css({ mt: 2 })}>
        <FollowButton
          subscriptionId={subscriptionId}
          objectId={podcast.id}
          type={SubscriptionObjectType.Document}
        />
      </div>
    </div>
  )
}

function PodcastsSection() {
  const { t } = useTranslation()
  const { data } = useQuery(OnboardingFormatsDocument, {
    variables: { repoIds: PODCASTS_FEATURED },
  })

  const subscriptions = data?.documents.nodes.map((document) => {
    const subscription = getFragmentData(
      SubscriptionFieldsFragmentDoc,
      document.subscribedBy.nodes,
    )[0]
    return {
      ...subscription,
      object:
        subscription.object.__typename === 'Document' &&
        getFragmentData(
          SubscriptionFieldsDocumentFragmentDoc,
          subscription.object,
        ),
    }
  })

  if (!subscriptions?.length) return null

  return (
    <Section>
      <SectionH3>{t('onboarding/podcasts/title')}</SectionH3>
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          pb: 4,
          md: {
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 4,
          },
        })}
      >
        {PODCASTS_FEATURED.map((repoId) => (
          <PodcastCard
            key={repoId}
            subscription={subscriptions.find(
              (sub) => sub.object?.repoId === repoId,
            )}
          />
        ))}
      </div>
    </Section>
  )
}

export default PodcastsSection
