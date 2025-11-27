import {
  NewsletterName,
  NewsletterSubscription,
  UpdateNewsletterSubscriptionDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useMutation } from '@apollo/client'
import { Spinner } from '@app/components/ui/spinner'
import { css } from '@republik/theme/css'
import { CircleCheck, PlusCircle } from 'lucide-react'
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

  async function toggleSubscription(e) {
    e.stopPropagation()

    if (isPending) return

    setIsPending(true)
    await updateNewsletterSubscription({
      variables: {
        name: newsletter,
        subscribed: !subscribed,
      },
    })
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
        <img
          className={css({
            flex: '0 0 1',
            alignSelf: 'flex-start',
            pt: 1,
          })}
          width='42'
          src='https://cdn.repub.ch/s3/republik-assets/repos/republik/wdwww-21-nov/images/93bddbde7caa064aab732fe6c42d474abab7a962.png?size=1890x945&format=auto&resize=768x'
          alt='newletter icon'
        />
        <div
          className={css({
            textAlign: 'left',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          })}
        >
          <h4
            className={css({
              textStyle: 'sansSerifMedium',
              fontSize: 'l',
              lineHeight: '1',
              mb: 1,
              maxWidth: '85%',
            })}
          >
            {t(`newsletters/${newsletter}/name`)}
          </h4>
          <p className={css({ lineHeight: '1.2', mb: 1 })}>
            {t(`newsletters/${newsletter}/description`)}
          </p>
          <p className={css({ color: 'textSoft', mt: 'auto' })}>
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
            <CircleCheck className={css({ color: 'primary' })} />
          ) : (
            <PlusCircle />
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
