const sleep = require('await-sleep')
const checkEnv = require('check-env')
const MandrillInterface = require('../MandrillInterface')
const logger = console

checkEnv([
  'DEFAULT_MAIL_FROM_ADDRESS',
  'DEFAULT_MAIL_FROM_NAME'
])

const {
  DEFAULT_MAIL_FROM_ADDRESS,
  DEFAULT_MAIL_FROM_NAME,
  NODE_ENV,
  SEND_MAILS,
  SEND_MAILS_DOMAIN_FILTER
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
module.exports = async (mail) => {
  // sanitize
  const message = {
    to: [{email: mail.to}],
    subject: mail.subject,
    from_email: mail.fromEmail || DEFAULT_MAIL_FROM_ADDRESS,
    from_name: mail.fromName || DEFAULT_MAIL_FROM_NAME,
    global_merge_vars: mail.globalMergeVars,
    auto_text: true
  }

  // don't send in dev, expect SEND_MAILS is true
  // don't send mails if SEND_MAILS is false
  const DEV = NODE_ENV && NODE_ENV !== 'production'
  if (SEND_MAILS === 'false' || (DEV && SEND_MAILS !== 'true')) {
    logger.log('\n\nSEND_MAIL prevented mail from being sent\n(SEND_MAIL == false or NODE_ENV != production and SEND_MAIL != true):\n', mail)
    return sleep(2000)
  }

  if (SEND_MAILS_DOMAIN_FILTER) {
    const domain = mail.to.split('@')[1]
    if (domain !== SEND_MAILS_DOMAIN_FILTER) {
      logger.log(`\n\nSEND_MAILS_DOMAIN_FILTER (${SEND_MAILS_DOMAIN_FILTER}) prevented mail from being sent:\n`, mail)
      return sleep(2000)
    }
  }

  const mandrill = new MandrillInterface({ logger })
  return mandrill.sendTemplate(message, mail.templateName, [])
}
