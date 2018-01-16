const MailchimpInterface = require('../MailchimpInterface')
const { NewsletterSubscription, isEligibleForInterestId, nameToInterestId } = require('./utils')
const { InterestIdNotFoundMailError, RolesNotEligibleMailError } = require('./errors')

const logger = console

module.exports = async ({ user, name, subscribed, status }) => {
  const { roles, email } = user
  const interestId = nameToInterestId[name]
  if (!interestId) {
    throw new InterestIdNotFoundMailError({ name })
  }

  if (!isEligibleForInterestId(interestId, roles)) {
    throw new RolesNotEligibleMailError({ roles, interestId })
  }

  // If a user subscribes to a newsletter but their status is not subscribed,
  // we need to set their status to 'pending' which triggers a new confirmation email
  // from mailchimp to re-subscribe.
  const body = (subscribed && status !== 'subscribed')
    ? {
      email_address: email,
      status: 'pending',
      interests: {
        [interestId]: !!subscribed
      }
    }
    : {
      interests: {
        [interestId]: !!subscribed
      }
    }

  const mailchimp = new MailchimpInterface({ logger })
  await mailchimp.updateMember(email, body)
  return NewsletterSubscription(user.id, interestId, subscribed, roles)
}
