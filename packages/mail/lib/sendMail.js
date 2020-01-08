const checkEnv = require('check-env')

const shouldScheduleMessage = require('../utils/shouldScheduleMessage')
const shouldSendMessage = require('../utils/shouldSendMessage')
const sendResultNormalizer = require('../utils/sendResultNormalizer')
const NodemailerInterface = require('../NodemailerInterface')
const MandrillInterface = require('../MandrillInterface')
const { send } = require('./mailLog')

checkEnv([
  'DEFAULT_MAIL_FROM_ADDRESS',
  'DEFAULT_MAIL_FROM_NAME'
])

const {
  DEFAULT_MAIL_FROM_ADDRESS,
  DEFAULT_MAIL_FROM_NAME,
  SEND_MAILS_TAGS
} = process.env

// usage
// sendMail({
//  to: 'p@tte.io',
//  fromEmail: 'jefferson@project-r.construction',
//  fromName: 'Jefferson',
//  subject: 'dear friend',
//  text: 'asdf asdf'
// })
module.exports = async (mail, context, log) => {
  // sanitize
  const tags = [].concat(
    SEND_MAILS_TAGS && SEND_MAILS_TAGS.split(',')
  ).filter(Boolean)

  mail.to = [{ email: mail.to }]
  mail.from_email = mail.fromEmail || DEFAULT_MAIL_FROM_ADDRESS
  mail.from_name = mail.fromName || DEFAULT_MAIL_FROM_NAME
  mail.tags = tags
  delete mail.fromName
  delete mail.fromEmail

  const message = { ...mail }

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
        return mandrill.send(mail)
      }

      return [{ error: 'No mailing interface usable', status: 'error' }]
    }
  )

  return send({
    log,
    sendFunc,
    message: mail,
    email: mail.to[0].email,
    context
  })
}
