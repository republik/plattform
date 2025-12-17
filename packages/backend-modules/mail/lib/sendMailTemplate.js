const checkEnv = require('check-env')
const debug = require('debug')('mail:lib:sendMailTemplate')
const fs = require('fs').promises
const path = require('path')
const Promise = require('bluebird')
const handlebars = require('handlebars')

const { timeFormat } = require('@orbiting/backend-modules-formats')

const shouldScheduleMessage = require('../utils/shouldScheduleMessage')
const shouldSendMessage = require('../utils/shouldSendMessage')
const sendResultNormalizer = require('../utils/sendResultNormalizer')
const NodemailerInterface = require('../NodemailerInterface')
const MandrillInterface = require('../MandrillInterface')
const { send } = require('./mailLog')

const { FONT_FACES, FONT_STYLES } = require('../fonts')

const dateFormat = timeFormat('%x')

checkEnv([
  'DEFAULT_MAIL_FROM_ADDRESS',
  'DEFAULT_MAIL_FROM_NAME',
  'ASSETS_SERVER_BASE_URL',
  'FRONTEND_BASE_URL',
  'SHOP_BASE_URL',
])

const {
  DEFAULT_MAIL_FROM_ADDRESS,
  DEFAULT_MAIL_FROM_NAME,
  SEND_MAILS_TAGS,
  SEND_MAILS_SUBJECT_PREFIX,
  FRONTEND_BASE_URL,
  ASSETS_SERVER_BASE_URL,
  SHOP_BASE_URL,
} = process.env

const getTemplate = async (filehandler) => {
  const template = await filehandler
    .readFile({ encoding: 'utf8' })
    .catch(() => null)
  await filehandler.close()
  return template
}

const getTemplates = async (name) => {
  const { html } = await Promise.props({
    html: fs
      .open(path.resolve(`${__dirname}/../templates/${name}.html`))
      .then(getTemplate)
      .catch(() => null),
  })

  return {
    html,
    getHtml: handlebars.compile(html || ''),
    getCompiler: handlebars.compile,
  }
}

const envMergeVars = [
  {
    name: 'frontend_base_url',
    content: FRONTEND_BASE_URL,
  },
  {
    name: 'shop_base_url',
    content: SHOP_BASE_URL,
  },
  {
    name: 'link_faq',
    content: `${FRONTEND_BASE_URL}/faq`,
  },
  {
    name: 'link_manifest',
    content: `${FRONTEND_BASE_URL}/manifest`,
  },
  {
    name: 'link_imprint',
    content: `${FRONTEND_BASE_URL}/impressum`,
  },
  {
    name: 'assets_server_base_url',
    content: ASSETS_SERVER_BASE_URL,
  },
  {
    name: 'link_signin',
    content: `${FRONTEND_BASE_URL}/anmelden`,
  },
  {
    name: 'link_claim_contextless',
    content: `${FRONTEND_BASE_URL}/abholen`,
  },
  {
    name: 'link_account',
    content: `${FRONTEND_BASE_URL}/konto`,
  },
  {
    name: 'link_account_goto',
    content: `${FRONTEND_BASE_URL}/konto`,
  },
  {
    name: 'link_account_abos',
    content: `${FRONTEND_BASE_URL}/konto#abos`,
  },
  {
    name: 'link_account_abos_goto',
    content: `${FRONTEND_BASE_URL}/konto`,
  },
  {
    name: 'link_account_newsletter',
    content: `${FRONTEND_BASE_URL}/konto/newsletter`,
  },
  {
    name: 'link_account_share',
    content: `${FRONTEND_BASE_URL}/teilen`,
  },
  {
    name: 'link_account_account',
    content: `${FRONTEND_BASE_URL}/konto#account`,
  },
  {
    name: 'link_account_notifications',
    content: `${FRONTEND_BASE_URL}/konto/benachrichtigungen`,
  },
  {
    name: 'link_account_progress',
    content: `${FRONTEND_BASE_URL}/konto/einstellungen#position`,
  },
  {
    name: 'link_account_signin_method',
    content: `${FRONTEND_BASE_URL}/konto/einstellungen#anmeldung`,
  },
  {
    name: 'link_profile',
    content: `${FRONTEND_BASE_URL}/~me`,
  },
  {
    name: 'link_bookmarks',
    content: `${FRONTEND_BASE_URL}/lesezeichen`,
  },
  {
    name: 'link_offers_overview',
    content: `${FRONTEND_BASE_URL}/angebote`,
  },
  {
    name: 'link_offers',
    content: `${FRONTEND_BASE_URL}/angebote?package=ABO`,
  },
  {
    name: 'link_offer_abo',
    content: `${FRONTEND_BASE_URL}/angebote?package=ABO`,
  },
  {
    name: 'link_offer_monthly_abo',
    content: `${FRONTEND_BASE_URL}/angebote?package=MONTHLY_ABO`,
  },
  {
    name: 'link_offer_benefactor',
    content: `${FRONTEND_BASE_URL}/angebote?package=BENEFACTOR`,
  },
  {
    name: 'link_offer_donate',
    content: `${FRONTEND_BASE_URL}/angebote?package=DONATE`,
  },
  {
    name: 'link_offer_abo_give',
    content: `${FRONTEND_BASE_URL}/angebote?package=ABO_GIVE`,
  },
  {
    name: 'link_offer_reduced',
    content: `${FRONTEND_BASE_URL}/angebote?package=ABO&userPrice=1`,
  },
  {
    name: 'link_offer_reduced_ausbildung',
    content: `${FRONTEND_BASE_URL}/angebote?package=ABO&userPrice=1&price=14000&reason=Ausbildung%3A%20`,
  },
  {
    name: 'link_shop_monthly_subscription',
    content: `${SHOP_BASE_URL}/angebot/MONTHLY`, // TODO might still change
  },
  {
    name: 'link_shop_yearly_subscription',
    content: `${SHOP_BASE_URL}/angebot/YEARLY`, // TODO might still change
  },
  {
    name: 'link_dialog',
    content: `${FRONTEND_BASE_URL}/dialog`,
  },
  {
    name: 'link_etikette',
    content: `${FRONTEND_BASE_URL}/etikette`,
  },
  {
    name: 'link_app',
    content: `${FRONTEND_BASE_URL}/app`,
  },
  {
    name: 'link_manual',
    content: `${FRONTEND_BASE_URL}/anleitung`,
  },
  {
    name: 'link_listen',
    content: `${FRONTEND_BASE_URL}/vorgelesen`,
  },
  {
    name: 'link_cockpit',
    content: `${FRONTEND_BASE_URL}/cockpit`,
  },
  {
    name: 'link_about',
    content: `${FRONTEND_BASE_URL}/about`,
  },
  {
    name: 'link_publisher',
    content: `${FRONTEND_BASE_URL}/verlag`,
  },
  {
    name: 'link_projectr',
    content: 'https://project-r.construction/',
  },
  {
    name: 'link_project_r',
    content: 'https://project-r.construction/news',
  },
  {
    name: 'today',
    content: dateFormat(new Date()),
  },
]

if (FONT_FACES) {
  envMergeVars.push({
    name: 'sg_font_faces',
    content: FONT_FACES,
  })
}

if (FONT_STYLES) {
  try {
    const styles = FONT_STYLES
    Object.keys(styles).forEach((styleKey) => {
      const style = styles[styleKey]
      envMergeVars.push({
        // sansSerifRegular -> SANS_SERIF_REGULAR
        name: `sg_font_style_${styleKey
          .replace(/[A-Z]/g, (char) => `_${char}`)
          .toLowerCase()}`,
        content: Object.keys(style)
          .map((key) => {
            // fontWeight -> font-weight
            return `${key.replace(
              /[A-Z]/g,
              (char) => `-${char.toLowerCase()}`,
            )}:${style[key]};`
          })
          .join(''),
      })
    })
  } catch (e) {
    console.warn('invalid FONT_STYLES')
  }
}

// usage
// sendMailTemplate({
//  to: 'p@tte.io',
//  fromEmail: 'jefferson@project-r.construction',
//  fromName: 'Jefferson',
//  subject: 'dear friend',
//  templateName: 'MANDRIL TEMPLATE',
//  globalMergeVars: [{
//    name: 'VARNAME',
//    content: 'replaced with this'
//  }],
//  attachments: [{
//    type: 'application/pdf',
//    name: 'SOMETHING.pdf',
//    content: '<base64 encoded content>'
//  }]
// })
module.exports = async (mail, context, log) => {
  // sanitize
  const tags = []
    .concat(SEND_MAILS_TAGS && SEND_MAILS_TAGS.split(','))
    .concat(mail.templateName && mail.templateName)
    .filter(Boolean)

  const mergeVars = [...(mail.globalMergeVars || []), ...envMergeVars].filter(
    Boolean,
  )

  const values = mergeVars.reduce((prev, curr) => {
    const { name, content } = curr

    prev[name] = content
    prev[name.toLowerCase()] = content
    prev[name.toUpperCase()] = content
    return prev
  }, {})

  const { getHtml } = await getTemplates(mail.templateName)

  const html = getHtml(values)

  const message = {
    to: [{ email: mail.to }],
    subject:
      (SEND_MAILS_SUBJECT_PREFIX &&
        `[${SEND_MAILS_SUBJECT_PREFIX}] ${mail.subject}`) ||
      mail.subject,
    from_email: mail.fromEmail || DEFAULT_MAIL_FROM_ADDRESS,
    from_name: mail.fromName || DEFAULT_MAIL_FROM_NAME,
    html,
    merge_language: mail.mergeLanguage || 'handlebars',
    global_merge_vars: mergeVars,
    auto_text: true,
    tags,
    attachments: mail.attachments,
  }

  debug({
    ...message,
    html: !!message.html,
    attachments: message.attachments?.map(({ name, type }) => ({ name, type })),
  })

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
          [],
        )
      }

      return [{ error: 'No mailing interface usable', status: 'error' }]
    },
  )

  return send({
    log,
    sendFunc,
    message: {
      ...message,
      html: !!message.html,
      attachments: message.attachments?.map(({ name, type }) => ({
        name,
        type,
      })),
    },
    email: message.to[0].email,
    template: mail.templateName,
    context,
  })
}

module.exports.getTemplates = getTemplates
module.exports.envMergeVars = envMergeVars
