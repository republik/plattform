const debug = require('debug')('access:lib:mail')

const { sendMailTemplate } = require('@orbiting/backend-modules-mail')
const { timeFormat } = require('@orbiting/backend-modules-formats')
const { transformUser } = require('@orbiting/backend-modules-auth')
const base64u = require('@orbiting/backend-modules-base64u')

const campaignsLib = require('./campaigns')
const membershipsLib = require('./memberships')
const eventsLib = require('./events')

const dateFormat = timeFormat('%x')

const { FRONTEND_BASE_URL } = process.env

const sendRecipientInvitation = async (grantee, campaign, grant, t, pgdb) => {
  debug('sendRecipientInvitation')

  const recipient = await pgdb.public.users.findOne({ email: grant.email })

  return sendMail(
    grant.email,
    'recipient',
    'invitation',
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

const sendRecipientOnboarding =
  async (grantee, campaign, recipient, grant, t, pgdb) =>
    sendMail(
      recipient.email,
      'recipient',
      'onboarding-2',
      {
        grantee,
        recipient,
        campaign,
        grant,
        t,
        pgdb
      }
    )

const sendRecipientExpired =
  async (grantee, campaign, recipient, grant, t, pgdb) =>
    sendMail(
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

const sendRecipientFollowup =
  async (grantee, campaign, recipient, grant, t, pgdb) =>
    sendMail(
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
    !!recipient && await campaignsLib.findForGrantee(recipient, { pgdb })
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

    // Grantee
    { name: 'GRANTEE_NAME',
      content: safeGrantee.name || t('api/noname')
    },
    { name: 'GRANTEE_MESSAGE',
      content: !!grant.message && grant.message.trim().replace(/\n/g, '<br />')
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
      content: `${FRONTEND_BASE_URL}/mitreden`
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
