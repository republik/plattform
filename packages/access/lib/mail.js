const debug = require('debug')('access:lib:mail')

const escape = require('escape-html')

const { sendMailTemplate } = require('@orbiting/backend-modules-mail')
const { timeFormat } = require('@orbiting/backend-modules-formats')
const { transformUser } = require('@orbiting/backend-modules-auth')
const base64u = require('@orbiting/backend-modules-base64u')

const campaignsLib = require('./campaigns')
const membershipsLib = require('./memberships')
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

module.exports = {
  // Invitation
  sendRecipientInvitation,

  // Onboarding
  sendRecipientOnboarding,

  // Offboarding when access expired
  sendRecipientExpired,

  // Followup after access expired
  sendRecipientFollowup
}

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
    !!recipient && await membershipsLib.hasUserActiveMembership(recipient, pgdb)

  const email = recipient ? recipient.email : grant.email

  return [
    // Grant,
    { name: 'GRANT_CREATED',
      content: dateFormat(grant.createdAt)
    },
    { name: 'GRANT_BEGIN_BEFORE',
      content: dateFormat(grant.beginBefore)
    },
    { name: 'GRANT_BEGIN',
      content: grant.beginAt && dateFormat(grant.beginAt)
    },
    { name: 'GRANT_END',
      content: grant.endAt && dateFormat(grant.endAt)
    },
    { name: 'GRANT_VOUCHER_CODE',
      content: grant.voucherCode
    },

    // Granter
    { name: 'GRANTER_NAME',
      content: safeGranter.name || t('api/noname')
    },
    { name: 'GRANTER_EMAIL',
      content: safeGranter.email
    },
    { name: 'GRANTER_MESSAGE',
      content: !!grant.message && escape(grant.message).replace(/\n/g, '<br />')
    },

    // Recipient
    { name: 'RECIPIENT_EMAIL',
      content: grant.email || safeRecipient.email
    },
    { name: 'RECIPIENT_NAME',
      content: safeRecipient.name || t('api/noname')
    },
    { name: 'RECIPIENT_HAS_MEMBERSHIPS',
      content: !!recipient && recipientHasMemberships
    },
    { name: 'RECIPIENT_HAS_CAMPAIGNS',
      content:
        !!recipient &&
        !!recipientCampaigns &&
        recipientCampaigns.length > 0
    },

    // Campaign
    { name: 'CAMPAIGN_TITLE',
      content: campaign.title
    },
    { name: 'CAMPAIGN_BEGIN',
      content: dateFormat(campaign.beginAt)
    },
    { name: 'CAMPAIGN_END',
      content: dateFormat(campaign.endAt)
    },
    { name: 'CAMPAIGN_PERIOD',
      content: getHumanInterval(campaign.grantPeriodInterval, t)
    },

    // Republik
    {
      name: 'REPUBLIK_MEMBERSHIPS_COUNT',
      content: await memberStatsCount({ pgdb })
    },

    // Links
    { name: 'LINK_SIGNIN',
      content: `${FRONTEND_BASE_URL}/anmelden`
    },
    { name: 'LINK_CLAIM_CONTEXTLESS',
      content: `${FRONTEND_BASE_URL}/abholen`
    },
    { name: 'LINK_CLAIM',
      content: `${FRONTEND_BASE_URL}/abholen?context=access`
    },
    { name: 'LINK_CLAIM_PREFILLED',
      content: `${FRONTEND_BASE_URL}/abholen?code=${grant.voucherCode}&email=${base64u.encode(email)}&context=access`
    },
    { name: 'LINK_ACCOUNT_SHARE',
      content: `${FRONTEND_BASE_URL}/konto#teilen`
    },
    { name: 'LINK_OFFERS_OVERVIEW',
      content: `${FRONTEND_BASE_URL}/angebote`
    },
    { name: 'LINK_OFFERS',
      content: `${FRONTEND_BASE_URL}/angebote?package=ABO`
    },
    { name: 'LINK_OFFER_ABO',
      content: `${FRONTEND_BASE_URL}/angebote?package=ABO`
    },
    { name: 'LINK_OFFER_MONTHLY_ABO',
      content: `${FRONTEND_BASE_URL}/angebote?package=MONTHLY_ABO`
    },
    { name: 'LINK_DISCUSSIONS',
      content: `${FRONTEND_BASE_URL}/dialog`
    },
    { name: 'LINK_MANIFEST',
      content: `${FRONTEND_BASE_URL}/manifest`
    },
    { name: 'LINK_IMPRESSUM',
      content: `${FRONTEND_BASE_URL}/impressum`
    },
    { name: 'LINK_PROJECTR',
      content: 'https://project-r.construction/'
    },
    { name: 'LINK_PROJECTR_NEWS',
      content: 'https://project-r.construction/news'
    }
  ]
}
