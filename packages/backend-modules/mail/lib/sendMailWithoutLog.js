/**
 * Like sendMailTemplate, but writes nothing to mailLog and needs no database.
 * For mails which must not leave the recipient's address behind, e.g. the
 * confirmation of a data deletion.
 *
 * Takes the same `mail` object as sendMailTemplate (to, subject, templateName,
 * fromEmail, fromName, globalMergeVars) and returns { status, result, error }
 * with status 'SENT' | 'SCHEDULED' | 'FAILED'.
 */
const { getTemplates, envMergeVars } = require('./sendMailTemplate')
const NodemailerInterface = require('../NodemailerInterface')
const MandrillInterface = require('../MandrillInterface')
const sendResultNormalizer = require('../utils/sendResultNormalizer')
const shouldSendMessage = require('../utils/shouldSendMessage')

const {
  DEFAULT_MAIL_FROM_ADDRESS,
  DEFAULT_MAIL_FROM_NAME,
  SEND_MAILS_TAGS,
  SEND_MAILS_SUBJECT_PREFIX,
} = process.env

module.exports = async (mail) => {
  const tags = []
    .concat(SEND_MAILS_TAGS && SEND_MAILS_TAGS.split(','))
    .concat(mail.templateName)
    .filter(Boolean)

  const mergeVars = [...(mail.globalMergeVars || []), ...envMergeVars].filter(
    Boolean,
  )
  const values = mergeVars.reduce((prev, { name, content }) => {
    prev[name] = content
    prev[name.toLowerCase()] = content
    prev[name.toUpperCase()] = content
    return prev
  }, {})

  const { html, getHtml } = await getTemplates(mail.templateName)
  if (!html) {
    throw new Error(`template ${mail.templateName} not found`)
  }

  const message = {
    to: [{ email: mail.to }],
    subject: SEND_MAILS_SUBJECT_PREFIX
      ? `[${SEND_MAILS_SUBJECT_PREFIX}] ${mail.subject}`
      : mail.subject,
    from_email: mail.fromEmail || DEFAULT_MAIL_FROM_ADDRESS,
    from_name: mail.fromName || DEFAULT_MAIL_FROM_NAME,
    html: getHtml(values),
    merge_language: 'handlebars',
    global_merge_vars: mergeVars,
    auto_text: true,
    tags,
  }

  const sendFunc = sendResultNormalizer(
    false, // shouldScheduleMessage
    shouldSendMessage(message),
    () => {
      const nodemailer = NodemailerInterface({ logger: console })
      if (nodemailer.isUsable(mail, message)) {
        return nodemailer.send(message)
      }

      const mandrill = MandrillInterface({ logger: console })
      if (mandrill.isUsable(mail, message)) {
        return mandrill.send(message, false, [])
      }

      return [{ error: 'No mailing interface usable', status: 'error' }]
    },
  )

  return sendFunc()
}
