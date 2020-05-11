const MailchimpInterface = require('../MailchimpInterface')
const logger = console

module.exports = async ({ user }) => {
  const { email, firstName, lastName } = user

  const body = {
    merge_fields: {
      FNAME: firstName || '',
      LNAME: lastName || ''
    }
  }

  const mailchimp = MailchimpInterface({ logger })
  await mailchimp.updateMember(email, body)
}
