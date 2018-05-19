const MailchimpInterface = require('../MailchimpInterface')
const {
  EmailRequiredMailError
 } = require('../errors')
const logger = console

module.exports = async ({
  user, newEmail
}) => {
  const { email: oldEmail } = user
  if (!oldEmail || !newEmail) {
    throw new EmailRequiredMailError()
  }

  const mailchimp = MailchimpInterface({ logger })
  const member = await mailchimp.getMember(oldEmail)
  if (member && member.status !== MailchimpInterface.MemberStatus.Unsubscribed) {
    // unsubscribe oldEmail
    await mailchimp.updateMember(oldEmail, {
      email_address: oldEmail,
      status: MailchimpInterface.MemberStatus.Unsubscribed
    })
    // subscribe newEmail
    await mailchimp.updateMember(newEmail, {
      email_address: newEmail,
      status_if_new: MailchimpInterface.MemberStatus.Subscribed,
      status: MailchimpInterface.MemberStatus.Subscribed,
      interests: member.interests
    })
    return true
  }
  return false
}
