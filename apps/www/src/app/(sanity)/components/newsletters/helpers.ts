import { NewsletterSettingsQuery } from '#graphql/republik-api/__generated__/gql/graphql'

export const isSubscribedToNewsletter = (
  name: string,
  subscriptions?: NonNullable<
    NewsletterSettingsQuery['me']['newsletterSettings']['subscriptions']
  >,
) => subscriptions?.find((s) => s?.name === name)?.subscribed
