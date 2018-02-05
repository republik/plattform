const MailchimpInterface = require('../MailchimpInterface')
const {
  InterestIdNotFoundMailError,
  RolesNotEligibleMailError,
  SubscriptionHandlerMissingMailError
 } = require('../errors')
const logger = console

module.exports = async ({
  user, name, subscribed
}, NewsletterSubscription) => {
  if (!NewsletterSubscription) throw new SubscriptionHandlerMissingMailError()

  const { roles, email } = user
  const interestId = NewsletterSubscription.interestIdByName(name)

  if (!interestId) {
    throw new InterestIdNotFoundMailError({ name })
  }

  if (!NewsletterSubscription.isEligibleForInterestId(interestId, roles)) {
    throw new RolesNotEligibleMailError({ roles, interestId })
  }

  const body = {
    email_address: email,
    status_if_new: MailchimpInterface.MemberStatus.Subscribed,
    interests: {
      [interestId]: !!subscribed
    }
  }

  const mailchimp = MailchimpInterface({ logger })
  const member = await mailchimp.getMember(email)
  if (member && member.status !== MailchimpInterface.MemberStatus.Subscribed) {
    // If a user subscribes to a newsletter but their status is not subscribed,
    // we need to set their status to 'pending' which triggers a new confirmation email
    // from mailchimp to re-subscribe.
    body.status = MailchimpInterface.MemberStatus.Pending
  }
  await mailchimp.updateMember(email, body)
  return NewsletterSubscription.buildSubscription(user.id, interestId, subscribed, roles)
}
