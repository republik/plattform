const debug = require('debug')('access:lib:mail')
const moment = require('moment')

const { sendMailTemplate } = require('@orbiting/backend-modules-mail')
const { timeFormat } = require('@orbiting/backend-modules-formats')
const { transformUser } = require('@orbiting/backend-modules-auth')

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
    { name: 'CAMPAIGN_NAME',
      content: campaign.name
    },
    { name: 'CAMPAIGN_END',
      content: dateFormat(campaign.endAt)
    },
    { name: 'HAS_CAMPAIGN_ENDED',
      content: grant.endAt < moment()
    }
  ]
}

const sendRecipientOnboarding = async (grantee, campaign, grant, t) => {
  debug('sendRecipientOnboarding')

  return sendMailTemplate({
    to: grant.email,
    fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
    subject: t('api/email/access/recpient/onboarding/subject'),
    templateName: 'access_recipient_onboarding',
    globalMergeVars: getGlobalMergeVars(grantee, campaign, grant)
  })
}

const sendGranteeConfirmation = async (grantee, campaign, grant, t) => {
  debug('sendGranteeConfirmation')

  return sendMailTemplate({
    to: grantee.email,
    fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
    subject: t('api/email/access/grantee/onboarding/subject'),
    templateName: 'access_grantee_onboarding',
    globalMergeVars: getGlobalMergeVars(grantee, campaign, grant)
  })
}

const sendRecipientExpirationNotice = async (grantee, campaign, grant, t) => {
  debug('sendRecipientExpirationNotice')

  return sendMailTemplate({
    to: grant.email,
    fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
    subject: t('api/email/access/recipient/expirationNotice/subject'),
    templateName: 'access_recipient_expiration_notice',
    globalMergeVars: getGlobalMergeVars(grantee, campaign, grant)
  })
}

const sendRecipientRevoked = async (grantee, campaign, grant, t) => {
  debug('sendRecipientRevoked')

  return sendMailTemplate({
    to: grant.email,
    fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
    subject: t('api/email/access/recipient/revoked/subject'),
    templateName: 'access_recipient_revoked',
    globalMergeVars: getGlobalMergeVars(grantee, campaign, grant)
  })
}

const sendGranteeRevoked = async (grantee, campaign, grant, t) => {
  debug('sendGranteeRevoked')

  return sendMailTemplate({
    to: grant.email,
    fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
    subject: t('api/email/access/grantee/revoked/subject'),
    templateName: 'access_grantee_revoked',
    globalMergeVars: getGlobalMergeVars(grantee, campaign, grant)
  })
}

const sendRecipientExpired = async (grantee, campaign, grant, t) => {
  debug('sendRecipientExpired')

  return sendMailTemplate({
    to: grant.email,
    fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
    subject: t('api/email/access/recipient/expired/subject'),
    templateName: 'access_recipient_expired',
    globalMergeVars: getGlobalMergeVars(grantee, campaign, grant)
  })
}

const sendGranteeExpired = async (grantee, campaign, grant, t) => {
  debug('sendGranteeExpired')

  return sendMailTemplate({
    to: grant.email,
    fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
    subject: t('api/email/access/grantee/expired/subject'),
    templateName: 'access_grantee_expired',
    globalMergeVars: getGlobalMergeVars(grantee, campaign, grant)
  })
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
  sendGranteeExpired
}
