const MailchimpInterface = require('../MailchimpInterface')
const { EmailRequiredMailError } = require('@orbiting/backend-modules-mail/errors')
const logger = console

module.exports = async ({ email }) => {
  if (!email) {
    throw new EmailRequiredMailError()
  }

  const mailchimp = MailchimpInterface({ logger })
  const deleted = MailchimpInterface.audiences.map((audienceId) => {
    return mailchimp.deleteMember(email, audienceId)
  })
  return deleted
}
