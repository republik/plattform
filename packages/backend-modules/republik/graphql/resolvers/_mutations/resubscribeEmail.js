const { Roles } = require('@orbiting/backend-modules-auth')
const MailchimpInterface = require('@orbiting/backend-modules-mailchimp')
const logger = console

const {
  cache: { create },
} = require('@orbiting/backend-modules-utils')

const QUERY_CACHE_TTL_SECONDS = 60 // One minute

module.exports = async (_, args, context) => {
  const { userId } = args
  const {
    user: me,
    pgdb,
    req,
    t,
    mail: { getNewsletterSettings },
  } = context

  const user = userId ? await pgdb.public.users.findOne({ id: userId }) : me

  if (!user) {
    console.error('user not found', { req: req._log() })
    throw new Error(t('api/users/404'))
  }

  Roles.ensureUserIsMeOrInRoles(user, me, ['supporter'])

  const { id, email, firstName, lastName } = user

  const mailchimp = MailchimpInterface({ logger })
  const member = await mailchimp.getMember(email)

  const body = {
    email_address: email,
  }

  if (!member) {
    body.status_if_new = MailchimpInterface.MemberStatus.Subscribed
    body.status = MailchimpInterface.MemberStatus.Subscribed
    body.merge_fields = {
      FNAME: firstName || '',
      LNAME: lastName || '',
    }
    await mailchimp.updateMember(email, body)
  } else {
    const cacheLock = create(
      {
        namespace: 'republik',
        prefix: 'mail:resubscribeEmail',
        key: id,
        ttl: QUERY_CACHE_TTL_SECONDS,
      },
      context,
    )

    const isLocked = await cacheLock.get()

    if (isLocked && member.status === MailchimpInterface.MemberStatus.Pending) {
      console.warn(`resubscribe email: user ${id} goes crazy`)
    }

    if (
      !isLocked &&
      member.status === MailchimpInterface.MemberStatus.Pending
    ) {
      body.status = MailchimpInterface.MemberStatus.Unsubscribed
      await mailchimp.updateMember(email, body)
    }

    if (member.status !== MailchimpInterface.MemberStatus.Subscribed) {
      body.status = MailchimpInterface.MemberStatus.Pending
      await mailchimp.updateMember(email, body)
      if (!isLocked) {
        await cacheLock.set(true)
      }
    }
  }

  try {
    return getNewsletterSettings({ user })
  } catch (error) {
    console.error('getNewsletterProfile failed', { error })
    throw new Error(t('api/newsletters/get/failed'))
  }
}
