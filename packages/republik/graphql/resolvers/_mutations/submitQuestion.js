const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const { sendMailTemplate, sendMail } = require('@orbiting/backend-modules-mail')

module.exports = async (_, args, context) => {
  const { user, req, t } = context
  ensureSignedIn(req)

  const { question } = args
  let name = user.firstName
    ? [' - ', user.firstName, user.lastName].join(' ')
    : ''

  const mailAddress =
    process.env.QUESTIONS_MAIL_FROM_ADDRESS ||
    process.env.DEFAULT_MAIL_FROM_ADDRESS

  await Promise.all([
    sendMail(
      {
        to: mailAddress,
        fromEmail: mailAddress,
        subject: 'Neue FAQ',
        text: `${user.email}${name} hat folgende Frage gestellt:\n\n${question}`,
      },
      context,
    ),
    sendMailTemplate(
      {
        to: user.email,
        fromEmail: mailAddress,
        subject: t('api/faq/mail/subject'),
        templateName: 'cf_faq',
        globalMergeVars: [
          { name: 'NAME', content: user.name },
          { name: 'QUESTION', content: question },
        ],
      },
      context,
    ),
  ])
  return { success: true }
}
