const debug = require('debug')('access:lib:mail')

const { sendMailTemplate } = require('@orbiting/backend-modules-mail')
const { timeFormat } = require('@orbiting/backend-modules-formats')
const { transformUser } = require('@orbiting/backend-modules-auth')

const campaignsLib = require('./campaigns')
const membershipsLib = require('./memberships')
const eventsLib = require('./events')

const dateFormat = timeFormat('%x')

const { FRONTEND_BASE_URL } = process.env

const sendRecipientOnboarding = async (grantee, campaign, grant, t, pgdb) => {
  debug('sendRecipientOnboarding')

  const recipient = await pgdb.public.users.findOne({ email: grant.email })

  return sendMail(
    grant.email,
    'recipient',
    'onboarding',
    {
      grantee,
      recipient,
      campaign,
      grant,
      t,
      pgdb
    }
  )
}

const sendRecipientExpirationNotice = async (
  grantee, campaign, grant, t, pgdb
) => {
  debug('sendRecipientExpirationNotice')

  const recipient = await pgdb.public.users.findOne({ email: grant.email })

  if (recipient) {
    return sendMail(
      recipient.email,
      'recipient',
      'expiration_notice',
      {
        grantee,
        recipient,
        campaign,
        grant,
        t,
        pgdb
      }
    )
  }

  return false
}

const sendRecipientExpired = async (grantee, campaign, grant, t, pgdb) => {
  debug('sendRecipientExpired')

  const recipient = await pgdb.public.users.findOne({ email: grant.email })

  if (recipient) {
    return sendMail(
      recipient.email,
      'recipient',
      'expired',
      {
        grantee,
        recipient,
        campaign,
        grant,
        t,
        pgdb
      }
    )
  }

  return false
}

const sendRecipientFollowup = async (grantee, campaign, grant, t, pgdb) => {
  debug('sendRecipientFollowup')

  const recipient = await pgdb.public.users.findOne({ email: grant.email })

  if (recipient) {
    return sendMail(
      recipient.email,
      'recipient',
      'followup',
      {
        grantee,
        recipient,
        campaign,
        grant,
        t,
        pgdb
      }
    )
  }

  return false
}

module.exports = {
  // Onboarding
  sendRecipientOnboarding,

  // Expiration Notice
  sendRecipientExpirationNotice,

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
    grantee,
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
      getTranslationVars(grantee)
    ),
    templateName: `access_${party}_${template}`,
    globalMergeVars: await getGlobalMergeVars(
      grantee,
      recipient,
      campaign,
      grant,
      t,
      pgdb
    )
  })

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

const getTranslationVars = (grantee) => {
  const safeGrantee = transformUser(grantee)

  return {
    granteeName: safeGrantee.name || safeGrantee.email
  }
}

const getGlobalMergeVars = async (
  grantee, recipient, campaign, grant, t, pgdb
) => {
  const safeGrantee = transformUser(grantee)
  const recipientCampaigns =
    !!recipient && await campaignsLib.findForGrantee(recipient, pgdb)
  const recipientHasMemberships =
    !!recipient && await membershipsLib.hasUserActiveMembership(recipient, pgdb)

  return [
    // Grant
    { name: 'GRANT_BEGIN',
      content: dateFormat(grant.beginAt)
    },
    { name: 'GRANT_END',
      content: dateFormat(grant.endAt)
    },

    // Grantee
    { name: 'GRANTEE_NAME',
      content: safeGrantee.name ||
        t('api/noname')
    },

    // Recipient
    { name: 'RECIPIENT_EMAIL',
      content: grant.email
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
      content: getHumanInterval(campaign.periodInterval, t)
    },

    // Links
    { name: 'LINK_SIGNIN',
      content: `${FRONTEND_BASE_URL}/anmelden`
    },
    { name: 'LINK_ACCOUNT_SHARE',
      content: `${FRONTEND_BASE_URL}/konto#teilen`
    },
    { name: 'LINK_OFFERS',
      content: `${FRONTEND_BASE_URL}/angebote?package=ABO`
    },
    { name: 'LINK_PROJECTR',
      content: 'https://project-r.construction/'
    }
  ]
}
