const MailchimpInterface = require('../MailchimpInterface')
const { EmailRequiredMailError } = require('../errors')
const logger = console

module.exports = async ({ user, newEmail }) => {
  const { email: oldEmail } = user
  if (!oldEmail || !newEmail) {
    throw new EmailRequiredMailError()
  }

  const mailchimp = MailchimpInterface({ logger })
  const member = await mailchimp.getMember(oldEmail)
  if (member) {
    // archive oldEmail
    await mailchimp.archiveMember(oldEmail)
    // subscribe newEmail with old member status and interests
    await mailchimp.updateMember(newEmail, {
      email_address: newEmail,
      status_if_new: member.status,
      status: member.status,
      interests: member.interests,
    })
    return true
  }
  return false
}
