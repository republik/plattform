import { NewsletterSubscription } from '#graphql/republik-api/__generated__/gql/graphql'
import { OnboardingH3 } from '@app/components/onboarding/onboarding-ui'
import { css } from '@republik/theme/css'
import { PlusCircle } from 'lucide-react'

function NewsletterCard({
  subscription,
}: {
  subscription: NewsletterSubscription
}) {
  return (
    <div
      className={css({
        display: 'flex',
        gap: 2,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'divider',
        p: 2,
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
      <div className={css({ textAlign: 'left' })}>
        <h4 className={css({ textStyle: 'sansSerifMedium', fontSize: 'l' })}>
          {subscription.name}
        </h4>
        <p className={css({ lineHeight: '1.2', mb: 1 })}>
          Jeden Morgen die kompakte Übersicht: Was die Republik aktuell zu
          bieten hat.
        </p>
        <p className={css({ color: 'textSoft' })}>Montag bis Freitag</p>
      </div>
      <button
        className={css({
          flex: '0 0 1',
          alignSelf: 'flex-start',
          pt: 1,
          pr: 1,
        })}
      >
        <PlusCircle />
      </button>
    </div>
  )
}

function NewsletterSection({
  title,
  subscriptions,
}: {
  title: string
  subscriptions: NewsletterSubscription[]
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
        {subscriptions.map((subscription) => (
          <NewsletterCard key={subscription.name} subscription={subscription} />
        ))}
      </div>
    </section>
  )
}

export default NewsletterSection
