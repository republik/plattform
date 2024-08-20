import { getConfig } from './config'

const {
  MAILCHIMP_INTEREST_NEWSLETTER_DAILY,
  MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY,
  MAILCHIMP_INTEREST_NEWSLETTER_CLIMATE,
  MAILCHIMP_INTEREST_NEWSLETTER_ACCOMPLICE,
  MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR,
  MAILCHIMP_INTEREST_NEWSLETTER_WDWWW,
} = getConfig()

const NewsletterSubscriptionConfig = [
  {
    name: 'DAILY',
    interestId: MAILCHIMP_INTEREST_NEWSLETTER_DAILY,
  },
  {
    name: 'WEEKLY',
    interestId: MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY,
  },
  {
    name: 'CLIMATE',
    interestId: MAILCHIMP_INTEREST_NEWSLETTER_CLIMATE,
  },
  {
    name: 'ACCOMPLICE',
    interestId: MAILCHIMP_INTEREST_NEWSLETTER_ACCOMPLICE,
    visibleToRoles: ['accomplice'],
  },
  {
    name: 'PROJECTR',
    interestId: MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR,
  },
  {
    name: 'WDWWW',
    interestId: MAILCHIMP_INTEREST_NEWSLETTER_WDWWW,
  },
]

export { NewsletterSubscriptionConfig }
