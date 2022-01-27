const MailchimpInterface = require('../MailchimpInterface')
const { EmailRequiredMailError } = require('../errors')
const logger = console

module.exports = async ({ email }) => {
  if (!email) {
    throw new EmailRequiredMailError()
  }

  const mailchimp = MailchimpInterface({ logger })
  return mailchimp.deleteMember(email)
}
