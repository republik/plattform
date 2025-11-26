import {
  Document,
  OnboardingFormatsDocument,
  SubToDocDocument,
  UnSubFromDocDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useMutation, useQuery } from '@apollo/client'
import { css } from '@republik/theme/css'
import { useState } from 'react'
import { useTranslation } from '../../../lib/withT'
import { PODCASTS_FEATURED } from './config'
import {
  OnboardingFollowButton,
  OnboardingH3,
  OnboardingSection,
} from './onboarding-ui'

function PodcastCard({ podcast }: { podcast: Document }) {
  const { t } = useTranslation()
  const [subToDoc] = useMutation(SubToDocDocument)
  const [unSubFromDoc] = useMutation(UnSubFromDocDocument)
  const [isPending, setIsPending] = useState(false)

  const subscriptionId = podcast.subscribedBy.nodes.find((n) => n.active)?.id

  async function toggleSubscription(e) {
    e.stopPropagation()

    if (isPending) return

    setIsPending(true)
    if (subscriptionId) {
      await unSubFromDoc({
        variables: {
          subscriptionId,
        },
      })
    } else {
      await subToDoc({
        variables: {
          documentId: podcast.id,
        },
      })
    }
    setIsPending(false)
  }

  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
      })}
      onClick={toggleSubscription}
      role='button'
    >
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          aspectRatio: '1/1',
          padding: 2,
          mb: 2,
          background: 'background.marketing',
          justifyContent: 'space-between',
        })}
      >
        <p
          className={css({
            fontFamily: 'republikSerif',
            fontSize: '3xl',
            lineHeight: '0.9',
            textAlign: 'right',
          })}
        >
          R
        </p>
        <h4
          className={css({
            fontFamily: 'republikSerif',
            fontSize: '3xl',
            lineHeight: '0.9',
          })}
        >
          {t(`onboarding/podcasts/${podcast.repoId}/title`)}
        </h4>
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
          onClick={toggleSubscription}
          subscribed={!!subscriptionId}
          isPending={isPending}
        />
      </div>
    </div>
  )
}

function PodcastsSection() {
  const { data } = useQuery(OnboardingFormatsDocument, {
    variables: { repoIds: PODCASTS_FEATURED },
  })

  const podcasts = data?.documents.nodes as Document[]

  if (!podcasts?.length) return null

  return (
    <OnboardingSection>
      <OnboardingH3>Podcasts und Audioserien</OnboardingH3>
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridGap: 8,
          pb: 4,
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
