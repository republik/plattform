const checkEnv = require('check-env')
const debug = require('debug')('mail:lib:sendMailTemplate')
const fs = require('fs')
const path = require('path')

const MandrillInterface = require('../MandrillInterface')
const { send } = require('./mailLog')
const shouldSendMessage = require('../utils/shouldSendMessage')
const sendResultNormalizer = require('../utils/sendResultNormalizer')

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

const envMergeVars = []

envMergeVars.push({
  name: 'frontend_base_url',
  content: FRONTEND_BASE_URL
})
envMergeVars.push({
  name: 'assets_server_base_url',
  content: ASSETS_SERVER_BASE_URL
})
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
  ]

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

  const shouldSend = shouldSendMessage(message)

  const sendFunc = sendResultNormalizer(
    shouldSend,
    () => MandrillInterface({ logger: console }).send(
      message,
      !message.html ? mail.templateName : false,
      []
    )
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
