import { NewsletterSettingsQuery } from '#graphql/republik-api/__generated__/gql/graphql'
import { type NewsletterName } from '@app/components/newsletters/config'

export const isSubscribedToNewsletter = (
  name: NewsletterName,
  subscriptions?: NonNullable<
    NewsletterSettingsQuery['me']['newsletterSettings']['subscriptions']
  >,
) => subscriptions?.find((s) => s?.name === name)?.subscribed
