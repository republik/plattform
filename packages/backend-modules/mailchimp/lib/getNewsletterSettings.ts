import MailchimpInterface from '../MailchimpInterface'
const { SubscriptionHandlerMissingMailError } = require('@orbiting/backend-modules-mail/errors')
const logger = console

export async function getNewsletterSettings({ user }, NewsletterSubscription) {
  if (!NewsletterSubscription) throw new SubscriptionHandlerMissingMailError()

  const { email, roles } = user

  const supportedInterestConfigs =
    NewsletterSubscription.allInterestConfigurations()

  const mailchimp = MailchimpInterface({ logger })
  const member = await mailchimp.getMember(email)

  const id = Buffer.from(`${user.id}/NewsletterSettings`).toString('base64')
  const status = member?.status || ''
  const subscriptions = supportedInterestConfigs.map(({ interestId }) =>
    NewsletterSubscription.buildSubscription(
      user.id,
      interestId,
      !!member?.interests?.[interestId], // subscribed
      roles,
    ),
  )
  return { id, status, subscriptions }
}
