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

  mail.to = [{email: mail.to}]
  mail.from_email = mail.fromEmail || DEFAULT_MAIL_FROM_ADDRESS
  mail.from_name = mail.fromName || DEFAULT_MAIL_FROM_NAME
  mail.tags = tags
  delete mail.fromName
  delete mail.fromEmail

  const shouldSend = shouldSendMessage(mail)

  const mandrill = MandrillInterface({ logger: console })
  const sendFunc = sendResultNormalizer(
    shouldSend,
    () => mandrill.send(mail)
  )

  return send(log, sendFunc, mail, context)
}
