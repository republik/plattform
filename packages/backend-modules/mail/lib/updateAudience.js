const MailchimpInterface = require('../MailchimpInterface')
const debug = require('debug')('mail:lib:updateAudience')
const logger = console

const addUserToAudience = async ({ user, name, audienceId }) => {
  const { email } = user

  debug('addUserToAudience called with ' + { email, user, name, audienceId })
  console.log('---------------------- inside addusertoaudience')

  if (!audienceId) {
    // throw new AudienceNotFoundError({ name }) // TODO add error
    console.error('No audience provided, cannot add user to audience')
  }

  const body = {
    email_address: email,
    status_if_new: MailchimpInterface.MemberStatus.Subscribed,
    status: MailchimpInterface.MemberStatus.Unsubscribed,
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

const removeUserFromAudience = async ({ user, name, audienceId }) => {
  const { email } = user

  debug(
    'removeUserFromAudience called with ' + { email, user, name, audienceId },
  )

  if (!audienceId) {
    // throw new AudienceNotFoundError({ name }) // TODO add error
    console.error('No audience provided, cannot remove user from audience')
  }

  const body = {
    email_address: email,
    status_if_new: MailchimpInterface.MemberStatus.Unsubscribed,
    status: MailchimpInterface.MemberStatus.Unsubscribed,
  }

  const mailchimp = MailchimpInterface({ logger })
  await mailchimp.updateMemberInAudience(email, body, audienceId)

  const result = {
    user,
    status: MailchimpInterface.MemberStatus.Unsubscribed,
  }
  debug(result)
  return result
}

module.exports = {
  addUserToAudience,
  removeUserFromAudience,
}
