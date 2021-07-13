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
    /* 
    add new member with old members interests
    set status to unsubscribed if the old member status was unsubscribed or 
    set it to subscribed in all other cases 
    */
    await mailchimp.updateMember(newEmail, {
      email_address: newEmail,
      status_if_new:
        member.status !== MailchimpInterface.MemberStatus.Unsubscribed
          ? MailchimpInterface.MemberStatus.Subscribed
          : member.status,
      status:
        member.status !== MailchimpInterface.MemberStatus.Unsubscribed
          ? MailchimpInterface.MemberStatus.Subscribed
          : member.status,
      interests: member.interests,
    })
    return true
  }
  return false
}
