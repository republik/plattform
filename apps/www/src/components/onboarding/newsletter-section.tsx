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
import { OnboardingH3 } from './onboarding-ui'

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

  async function toggleSubscription() {
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
        display: 'flex',
        gap: 2,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'divider',
        p: 4,
        cursor: 'pointer',
      })}
      onClick={toggleSubscription}
      role='button'
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
      <div className={css({ textAlign: 'left' })}>
        <h4
          className={css({
            textStyle: 'sansSerifMedium',
            fontSize: 'l',
            lineHeight: '1',
            mb: 1,
          })}
        >
          {t(`newsletters/${newsletter}/name`)}
        </h4>
        <p className={css({ lineHeight: '1.2', mb: 1 })}>
          {t(`newsletters/${newsletter}/description`)}
        </p>
        <p className={css({ color: 'textSoft' })}>
          {t(`newsletters/${newsletter}/schedule`)}
        </p>
      </div>
      {subscribed !== undefined && (
        <button
          className={css({
            flex: '0 0 1',
            alignSelf: 'flex-start',
            pt: 1,
            pr: 1,
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
    <section className={css({ pt: 4, textAlign: 'center' })}>
      <OnboardingH3>{title}</OnboardingH3>
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
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
    </section>
  )
}

export default NewsletterSection
