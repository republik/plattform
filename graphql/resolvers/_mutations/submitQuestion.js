const { sendMail, sendMailTemplate } = require('@orbiting/backend-modules-mail')
const { ensureSignedIn } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, {user, req, t}) => {
  ensureSignedIn(req, t)

  const { question } = args
  let name = user.firstName ? [' - ', user.firstName, user.lastName].join(' ') : ''

  await Promise.all([
    sendMail({
      to: process.env.QUESTIONS_MAIL_FROM_ADDRESS,
      fromEmail: process.env.QUESTIONS_MAIL_FROM_ADDRESS,
      subject: 'Neue FAQ',
      text: `${user.email}${name} hat folgende Frage gestellt:\n\n${question}`
    }),
    sendMailTemplate({
      to: user.email,
      fromEmail: process.env.QUESTIONS_MAIL_FROM_ADDRESS,
      subject: t('api/faq/mail/subject'),
      templateName: 'cf_faq',
      globalMergeVars: [
        { name: 'NAME',
          content: user.firstName + ' ' + user.lastName
        },
        { name: 'QUESTION',
          content: question
        }
      ]
    })
  ])
  return {success: true}
}
