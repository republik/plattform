const MailchimpInterface = require('../MailchimpInterface')
const {
  SubscriptionHandlerMissingMailError
 } = require('../errors')
const logger = console

module.exports = async ({
  user, interests
}, NewsletterSubscription) => {
  if (!NewsletterSubscription) throw new SubscriptionHandlerMissingMailError()

  const { email, roles } = user

  const mailchimp = new MailchimpInterface({ logger })
  await mailchimp.updateMember(email, {
    email_address: email,
    status: MailchimpInterface.MemberStatus.Subscribed,
    interests
  })

  return Object.keys(interests)
    .map(interestId => new NewsletterSubscription(user.id, interestId, interests[interestId], roles))
}
