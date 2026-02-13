import {
  NewsletterName,
  NewsletterSettingsQuery,
} from '#graphql/republik-api/__generated__/gql/graphql'

export const isSubscribedToNewsletter = (
  name: NewsletterName,
  subscriptions?: NonNullable<
    NewsletterSettingsQuery['me']['newsletterSettings']['subscriptions']
  >,
) => subscriptions?.find((s) => s?.name === name)?.subscribed
