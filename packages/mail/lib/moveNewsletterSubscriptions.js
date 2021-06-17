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
  if (
    member &&
    member.status !== MailchimpInterface.MemberStatus.Unsubscribed
  ) {
    // archive oldEmail
    await mailchimp.archiveMember(oldEmail)
    // subscribe newEmail
    await mailchimp.updateMember(newEmail, {
      email_address: newEmail,
      status_if_new: MailchimpInterface.MemberStatus.Subscribed,
      status: MailchimpInterface.MemberStatus.Subscribed,
      interests: member.interests,
    })
    return true
  }
  return false
}
