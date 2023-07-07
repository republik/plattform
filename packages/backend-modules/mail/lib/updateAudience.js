const MailchimpInterface = require('../MailchimpInterface')
const { AudienceNotFoundError } = require('../errors')
const debug = require('debug')('mail:lib:updateAudience')
const logger = console

const addUserToAudience = async ({ user, name, audienceId }) => {
  const { email } = user

  debug('addUserToAudience called with ' + { email, user, name, audienceId })

  if (!audienceId) {
    throw new AudienceNotFoundError({ name }) // TODO add error
  }

  const body = {
    email_address: email,
    status_if_new: MailchimpInterface.MemberStatus.Subscribed,
  }

  debug(body)

  const mailchimp = MailchimpInterface({ logger })
  await mailchimp.updateMemberInAudience(email, body, audienceId)

  // TODO tbd, maybe merge this with NewsletterSubscription
  const result = {
    user,
    status: MailchimpInterface.MemberStatus.Subscribed,
  }
  debug(result)
  return result
}

// const removeUserFromAudience = async ({ user, name, inAudience }) => {

// }

module.exports = {
  addUserToAudience,
}
