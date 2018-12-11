const debug = require('debug')('mail:lib:sendMailTemplate')
const checkEnv = require('check-env')
const MandrillInterface = require('../MandrillInterface')

const { send } = require('./mailLog')
const shouldSendMessage = require('../utils/shouldSendMessage')
const sendResultNormalizer = require('../utils/sendResultNormalizer')

checkEnv([
  'DEFAULT_MAIL_FROM_ADDRESS',
  'DEFAULT_MAIL_FROM_NAME'
])

const {
  DEFAULT_MAIL_FROM_ADDRESS,
  DEFAULT_MAIL_FROM_NAME,
  SEND_MAILS_TAGS,
  FRONTEND_BASE_URL
} = process.env

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
  const tags = [].concat(
    SEND_MAILS_TAGS && SEND_MAILS_TAGS.split(',')
  ).filter(Boolean)

  const mergeVars = [
    ...mail.globalMergeVars,
    ...FRONTEND_BASE_URL
      ? [{ name: 'frontend_base_url',
        content: FRONTEND_BASE_URL }]
      : []
  ]

  const message = {
    to: [{email: mail.to}],
    subject: mail.subject,
    from_email: mail.fromEmail || DEFAULT_MAIL_FROM_ADDRESS,
    from_name: mail.fromName || DEFAULT_MAIL_FROM_NAME,
    merge_language: mail.mergeLanguage || 'mailchimp',
    global_merge_vars: mergeVars,
    auto_text: true,
    tags
  }
  debug(message)

  const shouldSend = shouldSendMessage(message)

  const mandrill = MandrillInterface({ logger: console })
  const sendFunc = sendResultNormalizer(
    shouldSend,
    () => mandrill.send(message, mail.templateName, [])
  )

  return send({
    log,
    sendFunc,
    message,
    email: message.to[0].email,
    template: mail.templateName,
    context
  })
}
