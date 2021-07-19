const { Roles } = require('@orbiting/backend-modules-auth')
const MailchimpInterface = require('../../../../mail/MailchimpInterface')
const logger = console

module.exports = async (_, args, context) => {
  const { userId } = args
  const { user: me, pgdb, req, t } = context

  const user = userId ? await pgdb.public.users.findOne({ id: userId }) : me

  if (!user) {
    console.error('user not found', { req: req._log() })
    throw new Error(t('api/users/404'))
  }

  const { email } = user

  Roles.ensureUserIsMeOrInRoles(user, me, ['supporter'])

  const mailchimp = MailchimpInterface({ logger })
  const member = await mailchimp.getMember(email)

  if (member && member.status !== MailchimpInterface.MemberStatus.Subscribed) {
    await mailchimp.updateMember(email, {
      email_address: email,
      status: MailchimpInterface.MemberStatus.Pending,
    })
    return true
  }
  return false
}
