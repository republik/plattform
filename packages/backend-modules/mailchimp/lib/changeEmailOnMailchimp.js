const MailchimpInterface = require('../MailchimpInterface')
const { EmailRequiredMailError } = require('@orbiting/backend-modules-mail/errors')
const logger = console

module.exports = async ({ user, newEmail }) => {
  const { email: oldEmail } = user
  if (!oldEmail || !newEmail) {
    throw new EmailRequiredMailError()
  }

  const mailchimp = MailchimpInterface({ logger })

  MailchimpInterface.audiences.map((audienceId) =>
    moveSubscriptionsInAudience({
      mailchimp,
      oldEmail,
      newEmail,
      audienceId,
    }),
  )
}

const moveSubscriptionsInAudience = async ({
  mailchimp,
  oldEmail,
  newEmail,
  audienceId,
}) => {
  const member = await mailchimp.getMember(oldEmail, audienceId)

  if (member) {
    // archive oldEmail
    await mailchimp.archiveMember(oldEmail, audienceId)
    /* 
  add new member with old members interests
  set status to unsubscribed if the old member status was unsubscribed or 
  set it to subscribed in all other cases 
  */
    return mailchimp.updateMember(
      newEmail,
      {
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
        merge_fields: member.merge_fields,
        tags: member.tags,
      },
      audienceId,
    )
  }
}
