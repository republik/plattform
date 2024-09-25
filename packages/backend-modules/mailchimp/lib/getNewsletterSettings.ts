import { User } from '@orbiting/backend-modules-types'
import MailchimpInterface from '../MailchimpInterface'
import { SubscriptionHandlerMissingMailError } from './errors'
import { NewsletterSubscriptionInterface } from '../NewsletterSubscription'
const logger = console

export async function getNewsletterSettings(
  { user }: { user: User },
  NewsletterSubscription?: NewsletterSubscriptionInterface,
) {
  if (!NewsletterSubscription) throw new SubscriptionHandlerMissingMailError()

  const { email, roles } = user

  const supportedInterestConfigs =
    NewsletterSubscription.allInterestConfigurations()

  const mailchimp = MailchimpInterface({ logger })
  const member = await mailchimp.getMember(email)

  const id = Buffer.from(`${user.id}/NewsletterSettings`).toString('base64')
  const status = member?.status || ''
  const subscriptions = supportedInterestConfigs
    .map(({ interestId }: { interestId: string }) =>
      NewsletterSubscription.buildSubscription(
        user.id,
        interestId,
        !!member?.interests?.[interestId], // subscribed
        roles,
      ),
    )
    .filter((subscription: any) => !!subscription)
  return { id, status, subscriptions }
}
