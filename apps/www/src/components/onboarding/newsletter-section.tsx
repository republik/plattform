'use client'

import {
  NewsletterName,
  NewsletterSubscription,
  UpdateNewsletterSubscriptionDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useMutation } from '@apollo/client'
import { NL_STYLE } from '@app/components/onboarding/config'
import { Spinner } from '@app/components/ui/spinner'
import { useTrackEvent } from '@app/lib/analytics/event-tracking'
import { css } from '@republik/theme/css'
import { Check, Plus } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { useTranslation } from '../../../lib/withT'
import { OnboardingH3, OnboardingSection } from './onboarding-ui'

function NewsletterCard({
  newsletter,
  subscribed,
}: {
  newsletter: NewsletterName
  subscribed?: boolean
}) {
  const { t } = useTranslation()
  const [updateNewsletterSubscription] = useMutation(
    UpdateNewsletterSubscriptionDocument,
  )
  const [isPending, setIsPending] = useState(false)
  const track = useTrackEvent()

  async function toggleSubscription(e) {
    e.stopPropagation()

    if (isPending) return

    setIsPending(true)
    const { data } = await updateNewsletterSubscription({
      variables: {
        name: newsletter,
        subscribed: !subscribed,
      },
    })

    if (data) {
      track({
        action: data.updateNewsletterSubscription.subscribed
          ? 'Newsletter Subscribe'
          : 'Newsletter Unsubscribe',
        name: data.updateNewsletterSubscription.name,
      })
    }
    setIsPending(false)
  }

  return (
    <div
      className={css({
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'divider',
        p: 4,
        cursor: 'pointer',
        textAlign: 'left',
        position: 'relative',
      })}
      onClick={toggleSubscription}
      role='button'
    >
      <div
        className={css({
          display: 'flex',
          gap: 2,
          height: '100%',
        })}
      >
        <Image
          className={css({
            flex: '0 0 1',
            alignSelf: 'flex-start',
            pt: 1,
          })}
          width='64'
          src={NL_STYLE[newsletter]?.imageSrc}
          alt=''
        />
        <div
          className={css({
            textAlign: 'left',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            pr: '22px',
            md: { pr: 0 },
          })}
        >
          <h4
            className={css({
              textStyle: 'sansSerifMedium',
              fontSize: 'l',
              lineHeight: '1',
              mb: 1,
              md: {
                maxWidth: '80%',
              },
            })}
          >
            {t(`newsletters/${newsletter}/name`)}
          </h4>
          <p className={css({ lineHeight: '1.2', mb: 2 })}>
            {t(`newsletters/${newsletter}/description`)}
          </p>
          <p className={css({ color: 'textSoft' })}>
            {t(`newsletters/${newsletter}/schedule`)}
          </p>
        </div>
      </div>
      {subscribed !== undefined && (
        <button
          className={css({
            position: 'absolute',
            top: 4,
            right: 4,
            cursor: 'pointer',
          })}
          onClick={toggleSubscription}
          disabled={isPending}
        >
          {isPending ? (
            <Spinner size='large' />
          ) : subscribed ? (
            <Check
              strokeWidth={2.5}
              size={20}
              className={css({
                color: 'text.inverted',
                background: 'black',
                borderRadius: '100%',
                borderColor: 'black',
                borderWidth: '2px',
                borderStyle: 'solid',
                boxSizing: 'content-box',
              })}
            />
          ) : (
            <Plus
              className={css({
                borderRadius: '100%',
                borderWidth: '2px',
                borderStyle: 'solid',
              })}
            />
          )}
        </button>
      )}
    </div>
  )
}

const isSubscribed = (
  name: NewsletterName,
  subscriptions?: NewsletterSubscription[],
) => subscriptions?.find((s) => s?.name === name)?.subscribed

function NewsletterSection({
  title,
  newsletters,
  subscriptions,
}: {
  title: string
  newsletters: NewsletterName[]
  subscriptions?: NewsletterSubscription[]
}) {
  return (
    <OnboardingSection>
      <div className={css({ textAlign: 'center' })}>
        <OnboardingH3>{title}</OnboardingH3>
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            md: {
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
            },
          })}
        >
          {newsletters.map((newsletter) => (
            <NewsletterCard
              key={newsletter}
              newsletter={newsletter}
              subscribed={isSubscribed(newsletter, subscriptions)}
            />
          ))}
        </div>
      </div>
    </OnboardingSection>
  )
}

export default NewsletterSection
