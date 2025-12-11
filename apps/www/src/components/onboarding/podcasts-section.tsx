'use client'

import {
  Document,
  OnboardingFormatsDocument,
  SubscriptionObjectType,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { OnboardingFollowButton } from '@app/components/onboarding/follow-button'
import { css } from '@republik/theme/css'
import { useTranslation } from '../../../lib/withT'
import { PODCASTS_FEATURED, PODCASTS_STYLE } from './config'
import { OnboardingH3, OnboardingSection } from './onboarding-ui'

function PodcastCard({ podcast }: { podcast?: Document }) {
  const { t } = useTranslation()

  if (!podcast) return null

  const subscriptionId = podcast.subscribedBy.nodes.find((n) => n.active)?.id

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
        <OnboardingFollowButton
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

  const podcasts = data?.documents.nodes as Document[]

  if (!podcasts?.length) return null

  return (
    <OnboardingSection>
      <OnboardingH3>{t('onboarding/podcasts/title')}</OnboardingH3>
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
            podcast={podcasts.find((podcast) => podcast.repoId === repoId)}
          />
        ))}
      </div>
    </OnboardingSection>
  )
}

export default PodcastsSection
