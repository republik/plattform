'use client'

import {
  NewsletterName,
  NewsletterSettingsQuery,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { Section, SectionH3 } from '@app/components/ui/section'
import { css } from '@republik/theme/css'
import NewsletterCard from './newsletters-card'

const isSubscribed = (
  name: NewsletterName,
  subscriptions?: NonNullable<
    NewsletterSettingsQuery['me']['newsletterSettings']['subscriptions']
  >,
) => subscriptions?.find((s) => s?.name === name)?.subscribed

function NewslettersSection({
  title,
  newsletters,
  subscriptions,
  disabled,
}: {
  title: string
  newsletters: NewsletterName[]
  subscriptions?: NonNullable<
    NewsletterSettingsQuery['me']['newsletterSettings']['subscriptions']
  >
  disabled?: boolean
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
            <NewsletterCard
              key={newsletter}
              newsletter={newsletter}
              subscribed={isSubscribed(newsletter, subscriptions)}
              disabled={disabled}
            />
          ))}
        </div>
      </div>
    </Section>
  )
}

export default NewslettersSection
