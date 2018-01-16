const MailchimpInterface = require('../MailchimpInterface')
const logger = console

module.exports = async ({ user, interests }) => {
  const { email } = user

  const mailchimp = new MailchimpInterface({ logger })
  return mailchimp.updateMember(email, {
    email_address: email,
    status: 'subscribed',
    interests
  })
}
