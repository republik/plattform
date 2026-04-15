'use client'

import { NewsletterSettingsQuery } from '#graphql/republik-api/__generated__/gql/graphql'
import { type NewsletterName } from '@/app/components/newsletters/config'
import { isSubscribedToNewsletter } from '@/app/components/newsletters/helpers'
import { Section, SectionH3 } from '@/app/components/ui/section'
import { css } from '@republik/theme/css'
import NewsletterCard from './newsletters-card'

type CardComponentProps = {
  newsletter: NewsletterName
  subscribed?: boolean
  disabled?: boolean
}

function NewslettersSection({
  title,
  newsletters,
  subscriptions,
  disabled,
  CardComponent = NewsletterCard,
}: {
  title: string
  newsletters: NewsletterName[]
  subscriptions?: NonNullable<
    NewsletterSettingsQuery['me']['newsletterSettings']['subscriptions']
  >
  disabled?: boolean
  CardComponent?: React.ComponentType<CardComponentProps>
}) {
  return (
    <Section>
      <div className={css({ textAlign: 'center' })}>
        <SectionH3>{title}</SectionH3>
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
            <CardComponent
              key={newsletter}
              newsletter={newsletter}
              subscribed={isSubscribedToNewsletter(newsletter, subscriptions)}
              disabled={disabled}
            />
          ))}
        </div>
      </div>
    </Section>
  )
}

export default NewslettersSection
