const MailchimpInterface = require('../MailchimpInterface')
const { AudienceNotFoundError } = require('../errors')
const logger = console

const addUserToAudience = async ({ user, name, audienceId }) => {
  const { email } = user

  if (!audienceId) {
    throw new AudienceNotFoundError({ name }) // TODO add error
  }

  const body = {
    email_address: email,
    status_if_new: MailchimpInterface.MemberStatus.Subscribed,
  }

  const mailchimp = MailchimpInterface({ logger })
  await mailchimp.updateMemberInAudience(email, body, audienceId)

  // TODO tbd, maybe merge this with NewsletterSubscription
  const result = {
    user,
    status: MailchimpInterface.MemberStatus.Subscribed,
  }
  return result
}

// const removeUserFromAudience = async ({ user, name, inAudience }) => {

// }

module.exports = {
  addUserToAudience,
}
