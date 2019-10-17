const debug = require('debug')('access:lib:mail')

const escape = require('escape-html')

const { sendMailTemplate } = require('@orbiting/backend-modules-mail')
const { timeFormat } = require('@orbiting/backend-modules-formats')
const { transformUser } = require('@orbiting/backend-modules-auth')
const base64u = require('@orbiting/backend-modules-base64u')
const { hasUserActiveMembership } = require('@orbiting/backend-modules-utils')

const campaignsLib = require('./campaigns')
const eventsLib = require('./events')

const { count: memberStatsCount } = require('../../../servers/republik/lib/memberStats')

const dateFormat = timeFormat('%x')

const { FRONTEND_BASE_URL } = process.env

const sendRecipientInvitation = async (granter, campaign, grant, t, pgdb) => {
  debug('sendRecipientInvitation')

  const recipient = await pgdb.public.users.findOne({ email: grant.email })

  return sendMail(
    grant.email,
    'recipient',
    'invitation',
    {
      granter,
      recipient,
      campaign,
      grant,
      t,
      pgdb
    }
  )
}

const sendRecipientOnboarding =
  async (granter, campaign, recipient, grant, t, pgdb) =>
    sendMail(
      recipient.email,
      'recipient',
      'onboarding',
      {
        granter,
        recipient,
        campaign,
        grant,
        t,
        pgdb
      }
    )

const sendRecipientExpired =
  async (granter, campaign, recipient, grant, t, pgdb) =>
    sendMail(
      recipient.email,
      'recipient',
      'expired',
      {
        granter,
        recipient,
        campaign,
        grant,
        t,
        pgdb
      }
    )

const sendRecipientFollowup =
  async (granter, campaign, recipient, grant, t, pgdb) =>
    sendMail(
      recipient.email,
      'recipient',
      'followup',
      {
        granter,
        recipient,
        campaign,
        grant,
        t,
        pgdb
      }
    )

const sendMail = async (
  to,
  party,
  template,
  {
    granter,
    recipient,
    campaign,
    grant,
    t,
    pgdb
  }
) => {
  const emailConfig = getConfigEmails(party, template, campaign)
  if (emailConfig && emailConfig.enabled === false) {
    return false
  }

  const mail = await sendMailTemplate({
    to,
    fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
    subject: t(
      `api/access/email/${party}/${template}/subject`,
      getTranslationVars(granter)
    ),
    templateName: `access_${party}_${template}`,
    globalMergeVars: await getGlobalMergeVars(
      granter,
      recipient,
      campaign,
      grant,
      t,
      pgdb
    )
  }, { pgdb })

  await eventsLib.log(grant, `email.${party}.${template}`, pgdb)

  return mail
}

const getHumanInterval = (interval, t) =>
  Object
    .keys(interval)
    .map(unit => {
      return t.pluralize(
        `api/access/period/${unit}`,
        { count: interval[unit] }
      )
    })
    .join(` ${t('api/access/period/join')} `)
    .trim()

const getTranslationVars = (granter) => {
  const safeGranter = transformUser(granter)

  return {
    granterName: safeGranter.name || safeGranter.email
  }
}

const getGlobalMergeVars = async (
  granter, recipient, campaign, grant, t, pgdb
) => {
  const safeGranter = transformUser(granter)
  const safeRecipient = !!recipient && transformUser(recipient)
  const recipientCampaigns =
    !!recipient && await campaignsLib.findForGranter(recipient, { pgdb })
  const recipientHasMemberships =
    !!recipient && (await hasUserActiveMembership(recipient, pgdb))

  const email = recipient ? recipient.email : grant.email

  return [
    // Grant,
    { name: 'grant_created',
      content: dateFormat(grant.createdAt)
    },
    { name: 'grant_begin_before',
      content: dateFormat(grant.beginBefore)
    },
    { name: 'grant_begin',
      content: grant.beginAt && dateFormat(grant.beginAt)
    },
    { name: 'grant_end',
      content: grant.endAt && dateFormat(grant.endAt)
    },
    { name: 'grant_voucher_code',
      content: grant.voucherCode
    },

    // Granter
    { name: 'granter_name',
      content: safeGranter.name || t('api/noname')
    },
    { name: 'granter_email',
      content: safeGranter.email
    },
    { name: 'granter_message',
      content: !!grant.message && escape(grant.message).replace(/\n/g, '<br />')
    },

    // Recipient
    { name: 'recipient_email',
      content: grant.email || safeRecipient.email
    },
    { name: 'recipient_name',
      content: safeRecipient.name || t('api/noname')
    },
    { name: 'recipient_has_memberships',
      content: !!recipient && recipientHasMemberships
    },
    { name: 'recipent_has_campaigns',
      content:
        !!recipient &&
        !!recipientCampaigns &&
        recipientCampaigns.length > 0
    },

    // Campaign
    { name: 'campaign_title',
      content: campaign.title
    },
    { name: 'campaign_begin',
      content: dateFormat(campaign.beginAt)
    },
    { name: 'campaign_end',
      content: dateFormat(campaign.endAt)
    },
    { name: 'campaign_period',
      content: getHumanInterval(campaign.grantPeriodInterval, t)
    },

    // Republik
    {
      name: 'republik_memberships_count',
      content: await memberStatsCount({ pgdb })
    },

    // Links
    { name: 'link_claim',
      content: `${FRONTEND_BASE_URL}/abholen?context=access`
    },
    { name: 'link_claim_prefilled',
      content: `${FRONTEND_BASE_URL}/abholen?code=${grant.voucherCode}&email=${base64u.encode(email)}&context=access`
    }
  ]
}

const getConfigEmails = (party, template, campaign) => {
  const config = campaign.config

  if (!config.emails) {
    return
  }

  return config.emails.find(email => email.party === party && email.template === template)
}

module.exports = {
  // Invitation
  sendRecipientInvitation,

  // Onboarding
  sendRecipientOnboarding,

  // Offboarding when access expired
  sendRecipientExpired,

  // Followup after access expired
  sendRecipientFollowup,

  getTranslationVars,

  // Get global merge variables
  getGlobalMergeVars
}
