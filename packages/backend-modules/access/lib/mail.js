const debug = require('debug')('access:lib:mail')

const escape = require('escape-html')

const { sendMailTemplate } = require('@orbiting/backend-modules-mail')
const { timeFormat } = require('@orbiting/backend-modules-formats')
const { transformUser, AccessToken } = require('@orbiting/backend-modules-auth')
const base64u = require('@orbiting/backend-modules-base64u')
const { hasUserActiveMembership } = require('@orbiting/backend-modules-utils')
const { count } = require('@orbiting/backend-modules-republik/lib/roleStats')

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
  const fromEmail =
    (emailConfig && emailConfig.fromEmail) ||
    process.env.DEFAULT_MAIL_FROM_ADDRESS

  const fromName =
    (emailConfig && emailConfig.fromName) || process.env.DEFAULT_MAIL_FROM_NAME

  const mail = await sendMailTemplate(
    {
      to,
      fromEmail,
      fromName,
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

  const countClimateLabUsers = await count('climate', { pgdb })

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
    {
      name: 'recipientIsNotGranter',
      content: email !== safeGranter.email,
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

    // campaign «Klimalabor»
    {
      name: 'count_climate_lab_users',
      content: countClimateLabUsers,
    },
    {
      name: 'link_climate_lab_offer_abo',
      content: `${FRONTEND_BASE_URL}/angebote?package=ABO&utm_campaign=klimalabor`,
    },
    {
      name: 'link_climate_lab_offer_abo_give',
      content: `${FRONTEND_BASE_URL}/angebote?package=ABO_GIVE&utm_campaign=klimalabor`,
    },
    {
      name: 'link_climate_lab_onboarding_personal_infos',
      content: `${FRONTEND_BASE_URL}/einrichten?context=climate&section=climatepersonalinfo`,
    },
    {
      name: 'link_climate_lab_email_invitation',
      content:
        'mailto:?subject=Klimalabor%20%E2%80%94%20machst%20du%20mit%3F&body=Hallo%0D%0A%0D%0ADie%20Republik%20hat%20ein%20Klimalabor%20gestartet%2C%20einen%20Ort%20f%C3%BCr%20Austausch%20und%20Experimente%20f%C3%BCr%20alle%2C%20die%20der%20Klimakrise%20etwas%20entgegensetzen%20wollen%2C%20aber%20nicht%20so%20genau%20wissen%20wie.%20Letzlich%20geht%20es%20darum%2C%20herauszufinden%2C%20was%20Journalismus%20leisten%20kann%2C%20um%20in%20der%20Klimakrise%20seiner%20Rolle%20gerecht%20zu%20werden.%0D%0A%0D%0AIch%20bin%20dabei%20und%20w%C3%BCrde%20mich%20freuen%2C%20wenn%20du%20es%20dir%20auch%20mal%20anschaust%3A%20https%3A%2F%2Fwww.republik.ch/willkommen-zum-klimalabor',
    },
    {
      name: 'inviter_climate',
      content: safeGranter.name
        ? `${safeGranter.name} (${safeGranter.email})`
        : safeGranter.email,
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
