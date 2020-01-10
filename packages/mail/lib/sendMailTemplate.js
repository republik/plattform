const checkEnv = require('check-env')
const debug = require('debug')('mail:lib:sendMailTemplate')
const fs = require('fs')
const path = require('path')

const shouldScheduleMessage = require('../utils/shouldScheduleMessage')
const shouldSendMessage = require('../utils/shouldSendMessage')
const sendResultNormalizer = require('../utils/sendResultNormalizer')
const NodemailerInterface = require('../NodemailerInterface')
const MandrillInterface = require('../MandrillInterface')
const { send } = require('./mailLog')

checkEnv([
  'DEFAULT_MAIL_FROM_ADDRESS',
  'DEFAULT_MAIL_FROM_NAME',
  'ASSETS_SERVER_BASE_URL',
  'FRONTEND_BASE_URL'
])

const {
  DEFAULT_MAIL_FROM_ADDRESS,
  DEFAULT_MAIL_FROM_NAME,
  SEND_MAILS_TAGS,
  FRONTEND_BASE_URL,
  SG_FONT_STYLES,
  SG_FONT_FACES,
  ASSETS_SERVER_BASE_URL
} = process.env

const getTemplate = (name) => {
  const templatePath = path.resolve(`${__dirname}/../templates/${name}.html`)

  if (!fs.existsSync(templatePath)) {
    debug(`template "${name}" not found in templates folder`, { templatePath })
    return false
  }

  const contents = fs.readFileSync(templatePath, 'utf8')
  return contents
}

const envMergeVars = [
  {
    name: 'frontend_base_url',
    content: FRONTEND_BASE_URL
  },
  {
    name: 'link_faq',
    content: `${FRONTEND_BASE_URL}/faq`
  },
  {
    name: 'link_manifest',
    content: `${FRONTEND_BASE_URL}/manifest`
  },
  {
    name: 'link_imprint',
    content: `${FRONTEND_BASE_URL}/impressum`
  },
  {
    name: 'assets_server_base_url',
    content: ASSETS_SERVER_BASE_URL
  },
  {
    name: 'link_signin',
    content: `${FRONTEND_BASE_URL}/anmelden`
  },
  {
    name: 'link_claim_contextless',
    content: `${FRONTEND_BASE_URL}/abholen`
  },
  {
    name: 'link_account',
    content: `${FRONTEND_BASE_URL}/konto`
  },
  {
    name: 'link_account_abos',
    content: `${FRONTEND_BASE_URL}/konto#abos`
  },
  {
    name: 'link_account_share',
    content: `${FRONTEND_BASE_URL}/konto#teilen`
  },
  {
    name: 'link_account_account',
    content: `${FRONTEND_BASE_URL}/konto#account`
  },
  {
    name: 'link_account_notifications',
    content: `${FRONTEND_BASE_URL}/konto#benachrichtigungen`
  },
  {
    name: 'link_profile',
    content: `${FRONTEND_BASE_URL}/~me`
  },
  {
    name: 'link_offers_overview',
    content: `${FRONTEND_BASE_URL}/angebote`
  },
  {
    name: 'link_offers',
    content: `${FRONTEND_BASE_URL}/angebote?package=ABO`
  },
  {
    name: 'link_offer_abo',
    content: `${FRONTEND_BASE_URL}/angebote?package=ABO`
  },
  {
    name: 'link_offer_monthly_abo',
    content: `${FRONTEND_BASE_URL}/angebote?package=MONTHLY_ABO`
  },
  {
    name: 'link_offer_benefactor',
    content: `${FRONTEND_BASE_URL}/angebote?package=BENEFACTOR`
  },
  {
    name: 'link_offer_donate',
    content: `${FRONTEND_BASE_URL}/angebote?package=DONATE`
  },
  {
    name: 'link_offer_abo_give',
    content: `${FRONTEND_BASE_URL}/angebote?package=ABO_GIVE`
  },
  {
    name: 'link_offer_reduced_ausbildung',
    content: `${FRONTEND_BASE_URL}/angebote?package=ABO&userPrice=1&price=14000&reason=Ausbildung%3A%20`
  },
  {
    name: 'link_dialog',
    content: `${FRONTEND_BASE_URL}/dialog`
  },
  {
    name: 'link_app',
    content: `${FRONTEND_BASE_URL}/app`
  },
  {
    name: 'link_manual',
    content: `${FRONTEND_BASE_URL}/anleitung`
  },
  {
    name: 'link_listen',
    content: `${FRONTEND_BASE_URL}/vorgelesen`
  },
  {
    name: 'link_cockpit',
    content: `${FRONTEND_BASE_URL}/cockpit`
  },
  {
    name: 'link_projectr',
    content: 'https://project-r.construction/'
  },
  {
    name: 'link_project_r',
    content: 'https://project-r.construction/news'
  }
]

if (SG_FONT_FACES) {
  envMergeVars.push({
    name: 'sg_font_faces',
    content: SG_FONT_FACES
  })
}

if (SG_FONT_STYLES) {
  try {
    const styles = JSON.parse(SG_FONT_STYLES)
    Object.keys(styles).forEach(styleKey => {
      const style = styles[styleKey]
      envMergeVars.push({
        // sansSerifRegular -> SANS_SERIF_REGULAR
        name: `sg_font_style_${styleKey.replace(/[A-Z]/g, char => `_${char}`).toLowerCase()}`,
        content: Object.keys(style).map(key => {
          // fontWeight -> font-weight
          return `${key.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`)}:${style[key]};`
        }).join('')
      })
    })
  } catch (e) {
    console.warn('invalid SG_FONT_STYLES env')
  }
}

// usage
// sendMailTemplate({
//  to: 'p@tte.io',
//  fromEmail: 'jefferson@project-r.construction',
//  fromName: 'Jefferson',
//  subject: 'dear friend',
//  templateName: 'MANDRIL TEMPLATE',
//  globalMergeVars: {
//    name: 'VARNAME',
//    content: 'replaced with this'
//  }
// })
module.exports = async (mail, context, log) => {
  // sanitize
  const tags =
    []
      .concat(SEND_MAILS_TAGS && SEND_MAILS_TAGS.split(','))
      .concat(mail.templateName && mail.templateName)
      .filter(Boolean)

  const mergeVars = [
    ...mail.globalMergeVars || [],
    ...envMergeVars
  ].filter(Boolean)

  const message = {
    to: [{ email: mail.to }],
    subject: mail.subject,
    from_email: mail.fromEmail || DEFAULT_MAIL_FROM_ADDRESS,
    from_name: mail.fromName || DEFAULT_MAIL_FROM_NAME,
    html: getTemplate(mail.templateName),
    merge_language: mail.mergeLanguage || 'handlebars',
    global_merge_vars: mergeVars,
    auto_text: true,
    tags
  }

  debug({ ...message, html: !!message.html })

  const sendFunc = sendResultNormalizer(
    shouldScheduleMessage(mail, message),
    shouldSendMessage(message),
    () => {
      // Backup method to send emails
      const nodemailer = NodemailerInterface({ logger: console })
      if (nodemailer.isUsable(mail, message)) {
        return nodemailer.send(message)
      }

      // Default method to send emails
      const mandrill = MandrillInterface({ logger: console })
      if (mandrill.isUsable(mail, message)) {
        return mandrill.send(
          message,
          !message.html ? mail.templateName : false,
          []
        )
      }

      return [{ error: 'No mailing interface usable', status: 'error' }]
    }
  )

  return send({
    log,
    sendFunc,
    message: { ...message, html: !!message.html },
    email: message.to[0].email,
    template: mail.templateName,
    context
  })
}

module.exports.getTemplate = getTemplate
module.exports.envMergeVars = envMergeVars
