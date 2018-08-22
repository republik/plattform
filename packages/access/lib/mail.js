const debug = require('debug')('access:lib:mail')
const moment = require('moment')

const { sendMailTemplate } = require('@orbiting/backend-modules-mail')
const { timeFormat } = require('@orbiting/backend-modules-formats')
const { transformUser } = require('@orbiting/backend-modules-auth')

const eventsLib = require('./events')

const dateFormat = timeFormat('%x')

const getGlobalMergeVars = (grantee, campaign, grant) => {
  return [
    { name: 'GRANT_END',
      content: dateFormat(grant.endAt)
    },
    { name: 'GRANTEE_NAME',
      content: transformUser(grantee).name
    },
    { name: 'GRANTEE_EMAIL',
      content: transformUser(grantee).email
    },
    { name: 'RECIPIENT_EMAIL',
      content: grant.email
    },
    { name: 'CAMPAIGN_TITLE',
      content: campaign.title
    },
    { name: 'CAMPAIGN_END',
      content: dateFormat(campaign.endAt)
    },
    { name: 'HAS_CAMPAIGN_ENDED',
      content: grant.endAt < moment()
    }
  ]
}

const sendRecipientOnboarding = async (grantee, campaign, grant, t, pgdb) => {
  debug('sendRecipientOnboarding')

  const mail = await sendMailTemplate({
    to: grant.email,
    fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
    subject: t('api/email/access/recpient/onboarding/subject'),
    templateName: 'access_recipient_onboarding',
    globalMergeVars: getGlobalMergeVars(grantee, campaign, grant)
  })

  await eventsLib.log(grant, 'email.recipient.onboarding', pgdb)

  return mail
}

const sendGranteeConfirmation = async (grantee, campaign, grant, t, pgdb) => {
  debug('sendGranteeConfirmation')

  const mail = await sendMailTemplate({
    to: grantee.email,
    fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
    subject: t('api/email/access/grantee/onboarding/subject'),
    templateName: 'access_grantee_onboarding',
    globalMergeVars: getGlobalMergeVars(grantee, campaign, grant)
  })

  await eventsLib.log(grant, 'email.grantee.onboarding', pgdb)

  return mail
}

const sendRecipientExpirationNotice = async (grantee, campaign, grant, t, pgdb) => {
  debug('sendRecipientExpirationNotice')

  const mail = await sendMailTemplate({
    to: grant.email,
    fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
    subject: t('api/email/access/recipient/expirationNotice/subject'),
    templateName: 'access_recipient_expiration_notice',
    globalMergeVars: getGlobalMergeVars(grantee, campaign, grant)
  })

  await eventsLib.log(grant, 'email.recipient.expirationNotice', pgdb)

  return mail
}

const sendRecipientRevoked = async (grantee, campaign, grant, t, pgdb) => {
  debug('sendRecipientRevoked')

  const mail = await sendMailTemplate({
    to: grant.email,
    fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
    subject: t('api/email/access/recipient/revoked/subject'),
    templateName: 'access_recipient_revoked',
    globalMergeVars: getGlobalMergeVars(grantee, campaign, grant)
  })

  await eventsLib.log(grant, 'email.recipient.revoked', pgdb)

  return mail
}

const sendGranteeRevoked = async (grantee, campaign, grant, t, pgdb) => {
  debug('sendGranteeRevoked')

  const mail = await sendMailTemplate({
    to: grant.email,
    fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
    subject: t('api/email/access/grantee/revoked/subject'),
    templateName: 'access_grantee_revoked',
    globalMergeVars: getGlobalMergeVars(grantee, campaign, grant)
  })

  await eventsLib.log(grant, 'email.grantee.revoked', pgdb)

  return mail
}

const sendRecipientExpired = async (grantee, campaign, grant, t, pgdb) => {
  debug('sendRecipientExpired')

  const mail = sendMailTemplate({
    to: grant.email,
    fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
    subject: t('api/email/access/recipient/expired/subject'),
    templateName: 'access_recipient_expired',
    globalMergeVars: getGlobalMergeVars(grantee, campaign, grant)
  })

  await eventsLib.log(grant, 'email.recipient.expired', pgdb)

  return mail
}

const sendGranteeExpired = async (grantee, campaign, grant, t, pgdb) => {
  debug('sendGranteeExpired')

  const mail = await sendMailTemplate({
    to: grant.email,
    fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
    subject: t('api/email/access/grantee/expired/subject'),
    templateName: 'access_grantee_expired',
    globalMergeVars: getGlobalMergeVars(grantee, campaign, grant)
  })

  await eventsLib.log(grant, 'email.grantee.expired', pgdb)

  return mail
}

const sendRecipientFollowup = async (grantee, campaign, grant, t, pgdb) => {
  debug('sendRecipientFollowup')

  const mail = await sendMailTemplate({
    to: grant.email,
    fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
    subject: t('api/email/access/recipient/followup/subject'),
    templateName: 'access_recipient_followup',
    globalMergeVars: getGlobalMergeVars(grantee, campaign, grant)
  })

  await eventsLib.log(grant, 'email.recipient.followup', pgdb)

  return mail
}

module.exports = {
  // Onboarding
  sendRecipientOnboarding,
  sendGranteeConfirmation,

  // Expiration Notice
  sendRecipientExpirationNotice,

  // Offboarding when access expired
  sendRecipientRevoked,
  sendGranteeRevoked,

  // Offboarding when access expired
  sendRecipientExpired,
  sendGranteeExpired,

  // Followup after access expired
  sendRecipientFollowup
}
