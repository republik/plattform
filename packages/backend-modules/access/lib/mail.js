const debug = require('debug')('access:lib:mail')

const escape = require('escape-html')

const { sendMailTemplate } = require('@orbiting/backend-modules-mail')
const { timeFormat } = require('@orbiting/backend-modules-formats')
const { transformUser, AccessToken } = require('@orbiting/backend-modules-auth')
const base64u = require('@orbiting/backend-modules-base64u')
const { hasUserActiveMembership } = require('@orbiting/backend-modules-utils')

const campaignsLib = require('./campaigns')
const eventsLib = require('./events')

const dateFormat = timeFormat('%x')

const { FRONTEND_BASE_URL } = process.env

const sendRecipientInvitation = async (granter, campaign, grant, t, pgdb) => {
  debug('sendRecipientInvitation')

  let recipient = await pgdb.public.users.findOne({ email: grant.email })
  if (!recipient) {
    recipient = await pgdb.public.users.insertAndGet({
      email: grant.email,
    })
  }

  return sendMail(grant.email, 'recipient', 'invitation', {
    granter,
    recipient,
    campaign,
    grant,
    t,
    pgdb,
  })
}

const sendGranterClaimNotice = async (
  granter,
  campaign,
  recipient,
  grant,
  t,
  pgdb,
) =>
  sendMail(granter.email, 'granter', 'claim_notice', {
    granter,
    recipient,
    campaign,
    grant,
    t,
    pgdb,
  })

const sendRecipientOnboarding = async (
  granter,
  campaign,
  recipient,
  grant,
  t,
  pgdb,
) =>
  sendMail(recipient.email, 'recipient', 'onboarding', {
    granter,
    recipient,
    campaign,
    grant,
    t,
    pgdb,
  })

const sendRecipientExpired = async (
  granter,
  campaign,
  recipient,
  grant,
  t,
  pgdb,
) =>
  sendMail(recipient.email, 'recipient', 'expired', {
    granter,
    recipient,
    campaign,
    grant,
    t,
    pgdb,
  })

const sendRecipientRecommendations = async (
  granter,
  campaign,
  recipient,
  grant,
  t,
  pgdb,
) =>
  sendMail(recipient.email, 'recipient', 'recommendations', {
    granter,
    recipient,
    campaign,
    grant,
    t,
    pgdb,
  })

const sendRecipientFollowup = async (
  granter,
  campaign,
  recipient,
  grant,
  t,
  pgdb,
) =>
  sendMail(recipient.email, 'recipient', 'followup', {
    granter,
    recipient,
    campaign,
    grant,
    t,
    pgdb,
  })

const sendMail = async (
  to,
  party,
  template,
  { granter, recipient, campaign, grant, t, pgdb },
) => {
  const emailConfig = getConfigEmails(party, template, campaign)

  if (emailConfig && emailConfig.enabled === false) {
    return false
  }

  const actualTemplate = (emailConfig && emailConfig.actualTemplate) || template

  const mail = await sendMailTemplate(
    {
      to,
      fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
      subject: t(
        `api/access/email/${party}/${actualTemplate}/subject`,
        getTranslationVars(granter, recipient),
      ),
      templateName: `access_${party}_${actualTemplate}`,
      globalMergeVars: await getGlobalMergeVars(
        granter,
        recipient,
        campaign,
        grant,
        t,
        pgdb,
      ),
    },
    { pgdb },
  )

  await eventsLib.log(grant, `email.${party}.${actualTemplate}`, pgdb)

  return mail
}

const getHumanInterval = (interval, t) =>
  Object.keys(interval)
    .map((unit) => {
      return t.pluralize(`api/access/period/${unit}`, { count: interval[unit] })
    })
    .join(` ${t('api/access/period/join')} `)
    .trim()

const getTranslationVars = (granter, recipient) => {
  const safeGranter = transformUser(granter)
  const safeRecipient = transformUser(recipient)

  return {
    granterName: safeGranter.name || safeGranter.email,
    recipientName: safeRecipient && (safeRecipient.name || safeRecipient.email),
  }
}

const getGlobalMergeVars = async (
  granter,
  recipient,
  campaign,
  grant,
  t,
  pgdb,
) => {
  const safeGranter = transformUser(granter)
  const safeRecipient = !!recipient && transformUser(recipient)
  const recipientCampaigns =
    !!recipient && (await campaignsLib.findForGranter(recipient, { pgdb }))
  const recipientHasMemberships =
    !!recipient && (await hasUserActiveMembership(recipient, pgdb))

  const email = recipient ? recipient.email : grant.email
  const accessToken =
    !!recipient &&
    (await AccessToken.generateForUser(recipient, 'AUTHORIZE_SESSION'))

  const pledgerName =
    grant.perks &&
    grant.perks.giftMembership &&
    grant.perks.giftMembership.result &&
    grant.perks.giftMembership.result.pledger &&
    grant.perks.giftMembership.result.pledger.name

  const pledgeMessageToClaimers =
    grant.perks &&
    grant.perks.giftMembership &&
    grant.perks.giftMembership.result &&
    grant.perks.giftMembership.result.pledgeMessageToClaimers

  return [
    // Grant,
    {
      name: 'grant_created',
      content: dateFormat(grant.createdAt),
    },
    {
      name: 'grant_begin_before',
      content: dateFormat(grant.beginBefore),
    },
    {
      name: 'grant_begin',
      content: grant.beginAt && dateFormat(grant.beginAt),
    },
    {
      name: 'grant_end',
      content: grant.endAt && dateFormat(grant.endAt),
    },
    {
      name: 'grant_voucher_code',
      content: grant.voucherCode,
    },

    // Granter
    {
      name: 'granter_name',
      content: safeGranter.name || t('api/noname'),
    },
    {
      name: 'granter_email',
      content: safeGranter.email,
    },
    {
      name: 'granter_message',
      content:
        !!grant.message && escape(grant.message).replace(/\n/g, '<br />'),
    },

    // Recipient
    {
      name: 'recipient_email',
      content: grant.email || safeRecipient.email,
    },
    {
      name: 'recipient_name',
      content: safeRecipient.name || t('api/noname'),
    },
    {
      name: 'recipient_has_memberships',
      content: !!recipient && recipientHasMemberships,
    },
    {
      name: 'recipient_has_campaigns',
      content:
        !!recipient && !!recipientCampaigns && recipientCampaigns.length > 0,
    },

    // Campaign
    {
      name: 'campaign_title',
      content: campaign.title,
    },
    {
      name: 'campaign_begin',
      content: dateFormat(campaign.beginAt),
    },
    {
      name: 'campaign_end',
      content: dateFormat(campaign.endAt),
    },
    {
      name: 'campaign_period',
      content: getHumanInterval(campaign.grantPeriodInterval, t),
    },

    // Links
    {
      name: 'link_claim',
      content: `${FRONTEND_BASE_URL}/abholen?context=access`,
    },
    {
      name: 'link_claim_prefilled',
      content: `${FRONTEND_BASE_URL}/abholen?code=${grant.voucherCode}&email=${
        email ? base64u.encode(email) : ''
      }&id=${grant.id}&token=${accessToken}&context=access`,
    },

    // Perk "gift membership"
    pledgerName && {
      name: 'pledger_name',
      content: pledgerName,
    },
    pledgeMessageToClaimers && {
      name: 'message_to_claimer',
      content: escape(pledgeMessageToClaimers).replace(/\n/g, '<br />'),
    },
  ].filter(Boolean)
}

const getConfigEmails = (party, template, campaign) => {
  const config = campaign.config

  if (!config.emails) {
    return
  }

  return config.emails.find(
    (email) => email.party === party && email.template === template,
  )
}

module.exports = {
  // Invitation
  sendRecipientInvitation,

  // Claim Notice
  sendGranterClaimNotice,

  // Onboarding
  sendRecipientOnboarding,

  // Offboarding when access expired
  sendRecipientExpired,

  // Recommendations during access grant
  sendRecipientRecommendations,

  // Followup after access expired
  sendRecipientFollowup,
  getTranslationVars,

  // Get global merge variables
  getGlobalMergeVars,

  // Returns campaign-level config for party and template
  getConfigEmails,
}
