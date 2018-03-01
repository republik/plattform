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

  const mailchimp = MailchimpInterface({ logger })
  const member = await mailchimp.getMember(email)
  const body = {
    email_address: email,
    status_if_new: MailchimpInterface.MemberStatus.Subscribed,
    interests
  }
  if (member && member.status !== MailchimpInterface.MemberStatus.Unsubscribed) {
    // if a user is unsubscribed we don't update a status
    body.status = MailchimpInterface.MemberStatus.Subscribed
  }

  await mailchimp.updateMember(email, body)

  // user might be null if using with just {email, roles}
  return user && user.id && Object.keys(interests)
    .map(interestId => NewsletterSubscription.buildSubscription(user.id, interestId, interests[interestId], roles))
}
