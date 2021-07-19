const MailchimpInterface = require('../MailchimpInterface')
const {
  InterestIdNotFoundMailError,
  SubscriptionHandlerMissingMailError,
} = require('../errors')
const logger = console

module.exports = async (
  { user, name, subscribed, ignoreMemberUnsubscribed = false },
  NewsletterSubscription,
) => {
  if (!NewsletterSubscription) throw new SubscriptionHandlerMissingMailError()

  const { email } = user
  const interestId = NewsletterSubscription.interestIdByName(name)

  if (!interestId) {
    throw new InterestIdNotFoundMailError({ name })
  }

  /* I guess: 
  - status_if_new should stay at it is */
  const body = {
    email_address: email,
    status_if_new: MailchimpInterface.MemberStatus.Subscribed,
    interests: {
      [interestId]: !!subscribed,
    },
  }

  const mailchimp = MailchimpInterface({ logger })
  await mailchimp.updateMember(email, body)

  return NewsletterSubscription.buildSubscription(
    user.id,
    interestId,
    subscribed,
  )
}
